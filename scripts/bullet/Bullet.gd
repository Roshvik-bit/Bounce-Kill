extends CharacterBody3D
class_name Bullet

## ==============================================================================
## Bounce Kill - Bullet (Rigid / Kinematic Ricochet Projectile)
##
## THE RICOCHET RULE:
## - Direct shots on enemies do ZERO damage and expire ("Uncharged" Cyan).
## - Bouncing off static walls/obstacles activates "Charged Lethal" mode (Crimson).
## - Lethal bullets deal full damage on enemy contact with multi-bounce multipliers.
## ==============================================================================

signal state_changed(new_state: BulletState)
signal bounced(bounce_count: int, normal: Vector3)

enum BulletState {
	UNCHARGED,      # Cyan: Harmless on direct enemy contact
	CHARGED_LETHAL, # Crimson: Lethal after bouncing off an obstacle
	EXPIRED
}

@export_group("Physics & Trajectory")
@export var speed: float = 48.0
@export var max_bounces: int = 5
@export var base_damage: int = 50
@export var lifetime: float = 5.0

@export_group("Visuals & Theme")
@export var cyan_color: Color = Color(0.0, 0.94, 1.0, 1.0)       # #00F0FF (Uncharged)
@export var crimson_color: Color = Color(1.0, 0.05, 0.28, 1.0)   # #FF0D47 (Charged Lethal)
@export var impact_effect_scene: PackedScene

# Internal state
var current_state: BulletState = BulletState.UNCHARGED
var bounce_count: int = 0
var alive_time: float = 0.0

# Node references
@onready var mesh_instance: MeshInstance3D = $MeshInstance3D
@onready var omni_light: OmniLight3D = $OmniLight3D
@onready var trail_particles: GPUParticles3D = $TrailParticles
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var audio_player: AudioStreamPlayer3D = $AudioStreamPlayer3D

# Dynamic material instance
var bullet_material: StandardMaterial3D


func _ready() -> void:
	# Initialize dynamic material for color swapping
	_setup_materials()
	_apply_state_visuals(BulletState.UNCHARGED)


func _physics_process(delta: float) -> void:
	if current_state == BulletState.EXPIRED:
		return

	alive_time += delta
	if alive_time >= lifetime:
		_expire("Lifetime expired")
		return

	# Move projectile using kinematic collision step
	var motion: Vector3 = velocity * delta
	var collision: KinematicCollision3D = move_and_collide(motion)

	if collision:
		_handle_collision(collision)


## -----------------------------------------------------------------------------
## Core Collision & Ricochet Logic
## -----------------------------------------------------------------------------
func _handle_collision(collision: KinematicCollision3D) -> void:
	var collider: Object = collision.get_collider()
	var normal: Vector3 = collision.get_normal()
	var hit_pos: Vector3 = collision.get_position()

	# Check if we hit an Enemy (Layer 3 or "enemies" group)
	if _is_enemy(collider):
		_handle_enemy_hit(collider, hit_pos, normal)
		return

	# Otherwise, we hit a Static Obstacle / Wall (Layer 1)
	_handle_wall_bounce(collision, normal, hit_pos)


func _handle_enemy_hit(enemy_collider: Object, hit_pos: Vector3, normal: Vector3) -> void:
	match current_state:
		BulletState.UNCHARGED:
			# ==================================================================
			# THE RICOCHET RULE: Direct hit = 0 DAMAGE!
			# ==================================================================
			print("[Ricochet Rule] Direct shot on enemy! ZERO DAMAGE caused. Deflected!")
			_spawn_impact(hit_pos, normal, false)
			
			if enemy_collider.has_method("on_deflect"):
				enemy_collider.on_deflect(hit_pos)
			
			_play_deflect_sound()
			_expire("Direct hit dud")

		BulletState.CHARGED_LETHAL:
			# ==================================================================
			# LETHAL HIT: Multiplier applied based on bounce count!
			# ==================================================================
			var multiplier: float = GameManager.calculate_bounce_bonus(bounce_count)
			var total_damage: int = int(round(float(base_damage) * multiplier))

			print("[Ricochet Rule] LETHAL BANK SHOT! Bounces: %d | Damage: %d" % [bounce_count, total_damage])
			_spawn_impact(hit_pos, normal, true)

			if enemy_collider.has_method("take_damage"):
				enemy_collider.take_damage(total_damage, hit_pos, velocity.normalized(), bounce_count)

			_expire("Lethal enemy hit")


func _handle_wall_bounce(collision: KinematicCollision3D, normal: Vector3, hit_pos: Vector3) -> void:
	bounce_count += 1
	bounced.emit(bounce_count, normal)

	# Reflect velocity vector along collision normal
	velocity = velocity.bounce(normal)
	
	# Orient mesh in the new direction of travel
	if velocity.length_squared() > 0.001:
		look_at(global_position + velocity.normalized(), Vector3.UP if abs(velocity.normalized().y) < 0.9 else Vector3.RIGHT)

	# Transition from UNCHARGED (Cyan) to CHARGED_LETHAL (Crimson) on first wall bounce
	if current_state == BulletState.UNCHARGED:
		_transition_to_state(BulletState.CHARGED_LETHAL)
		_play_charge_sound()
	else:
		_play_ricochet_sound()

	_spawn_impact(hit_pos, normal, current_state == BulletState.CHARGED_LETHAL)

	# Terminate if max bounces exceeded
	if bounce_count >= max_bounces:
		_expire("Max bounces reached (%d)" % max_bounces)
		return

	# Prevent sticking/tunneling: advance remaining motion along the reflection vector
	var remainder: Vector3 = collision.get_remainder().bounce(normal)
	if remainder.length() > 0.001:
		move_and_collide(remainder)


## -----------------------------------------------------------------------------
## State Transitions & Visual Polish
## -----------------------------------------------------------------------------
func _transition_to_state(new_state: BulletState) -> void:
	current_state = new_state
	state_changed.emit(new_state)
	_apply_state_visuals(new_state)


func _setup_materials() -> void:
	bullet_material = StandardMaterial3D.new()
	bullet_material.shading_mode = StandardMaterial3D.SHADING_MODE_UNSHADED
	bullet_material.emission_enabled = true
	
	if mesh_instance:
		mesh_instance.material_override = bullet_material


func _apply_state_visuals(state: BulletState) -> void:
	var target_color: Color = crimson_color if state == BulletState.CHARGED_LETHAL else cyan_color
	var target_energy: float = 4.0 if state == BulletState.CHARGED_LETHAL else 2.0

	if bullet_material:
		bullet_material.albedo_color = target_color
		bullet_material.emission = target_color
		bullet_material.emission_energy_multiplier = target_energy

	if omni_light:
		omni_light.light_color = target_color
		omni_light.light_energy = target_energy

	if trail_particles and trail_particles.process_material is ParticleProcessMaterial:
		var p_mat: ParticleProcessMaterial = trail_particles.process_material.duplicate() as ParticleProcessMaterial
		p_mat.color = target_color
		trail_particles.process_material = p_mat


func _spawn_impact(pos: Vector3, normal: Vector3, is_lethal: bool) -> void:
	if not impact_effect_scene:
		return
	var impact: Node3D = impact_effect_scene.instantiate() as Node3D
	get_parent().add_child(impact)
	impact.global_position = pos
	if impact.has_method("setup"):
		impact.setup(is_lethal, normal)


func _is_enemy(collider: Object) -> bool:
	if not collider:
		return false
	return collider.is_in_group("enemies") or collider.has_method("take_damage")


func _expire(_reason: String) -> void:
	current_state = BulletState.EXPIRED
	set_physics_process(false)
	if collision_shape:
		collision_shape.set_deferred("disabled", true)
	queue_free()


## -----------------------------------------------------------------------------
## Audio Feedback (Procedural fallback if no audio stream asset assigned)
## -----------------------------------------------------------------------------
func _play_charge_sound() -> void:
	if not audio_player:
		return
	# Pitch increases with bounce count for satisfying punch
	audio_player.pitch_scale = clampf(1.0 + float(bounce_count) * 0.2, 0.8, 2.5)
	if audio_player.stream:
		audio_player.play()


func _play_ricochet_sound() -> void:
	if not audio_player:
		return
	audio_player.pitch_scale = clampf(1.1 + float(bounce_count) * 0.25, 0.9, 2.8)
	if audio_player.stream:
		audio_player.play()


func _play_deflect_sound() -> void:
	if not audio_player:
		return
	audio_player.pitch_scale = 0.6
	if audio_player.stream:
		audio_player.play()

