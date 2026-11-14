extends CharacterBody3D
class_name Enemy

## ==============================================================================
## Bounce Kill - Enemy AI (CharacterBody3D)
##
## THE RICOCHET RULE:
## - Totally immune to direct uncharged shots (deflects harmlessly).
## - Takes lethal damage ONLY from bullets that have bounced off a wall.
## - Features Patrol / Chase / Attack state machine with LoS raycasting.
## ==============================================================================

signal enemy_damaged(current_hp: int, max_hp: int)
signal enemy_died(bounces_recorded: int)

enum State {
	PATROL,
	CHASE,
	ATTACK,
	DEAD
}

@export_group("Stats & Balance")
@export var max_health: int = 100
@export var move_speed: float = 4.2
@export var chase_speed: float = 6.0
@export var attack_damage: int = 15
@export var attack_range: float = 2.2
@export var attack_rate: float = 1.2
@export var vision_range: float = 25.0

@export_group("Patrol Behavior")
@export var patrol_radius: float = 12.0
@export var patrol_wait_time: float = 2.5

# Runtime state
var current_health: int = 100
var current_state: State = State.PATROL
var target_player: CharacterBody3D = null
var home_position: Vector3
var current_patrol_target: Vector3
var patrol_timer: float = 0.0
var attack_timer: float = 0.0
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

# Visual flash materials
@onready var mesh_instance: MeshInstance3D = $MeshInstance3D
@onready var los_raycast: RayCast3D = $VisionRayCast
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var shield_mesh: MeshInstance3D = $ShieldMesh

var body_material: StandardMaterial3D


func _ready() -> void:
	add_to_group("enemies")
	GameManager.register_enemy()

	current_health = max_health
	home_position = global_position
	_pick_new_patrol_target()
	_setup_materials()


func _physics_process(delta: float) -> void:
	if current_state == State.DEAD:
		return

	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Check sightline to player
	_evaluate_player_awareness()

	# State Machine execution
	match current_state:
		State.PATROL:
			_process_patrol(delta)
		State.CHASE:
			_process_chase(delta)
		State.ATTACK:
			_process_attack(delta)

	move_and_slide()


## -----------------------------------------------------------------------------
## AI Vision & State Transitions
## -----------------------------------------------------------------------------
func _evaluate_player_awareness() -> void:
	if not target_player:
		# Locate player in scene tree
		var players: Array[Node] = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			target_player = players[0] as CharacterBody3D
		return

	var dist_to_player: float = global_position.distance_to(target_player.global_position)

	if dist_to_player <= vision_range:
		# Cast ray to player's center of mass
		var player_center: Vector3 = target_player.global_position + Vector3(0.0, 1.0, 0.0)
		var my_eye: Vector3 = global_position + Vector3(0.0, 1.4, 0.0)

		los_raycast.global_position = my_eye
		los_raycast.target_position = los_raycast.to_local(player_center)
		los_raycast.force_raycast_update()

		if los_raycast.is_colliding():
			var collider: Object = los_raycast.get_collider()
			if collider == target_player:
				# Line of sight confirmed
				if dist_to_player <= attack_range:
					current_state = State.ATTACK
				else:
					current_state = State.CHASE
				return

	# Lost sight / out of range: drop back to patrol
	if current_state != State.PATROL:
		current_state = State.PATROL
		_pick_new_patrol_target()


func _process_patrol(delta: float) -> void:
	var dist_to_target: float = global_position.distance_to(current_patrol_target)

	if dist_to_target < 1.2:
		# Wait at patrol point
		velocity.x = move_toward(velocity.x, 0.0, move_speed * delta * 5.0)
		velocity.z = move_toward(velocity.z, 0.0, move_speed * delta * 5.0)

		patrol_timer += delta
		if patrol_timer >= patrol_wait_time:
			patrol_timer = 0.0
			_pick_new_patrol_target()
	else:
		# Walk toward patrol waypoint
		var move_dir: Vector3 = (current_patrol_target - global_position).normalized()
		velocity.x = move_dir.x * move_speed
		velocity.z = move_dir.z * move_speed
		_face_direction(move_dir)


func _process_chase(_delta: float) -> void:
	if not target_player:
		return

	var dist: float = global_position.distance_to(target_player.global_position)
	if dist <= attack_range:
		current_state = State.ATTACK
		return

	var chase_dir: Vector3 = (target_player.global_position - global_position).normalized()
	velocity.x = chase_dir.x * chase_speed
	velocity.z = chase_dir.z * chase_speed
	_face_direction(chase_dir)


func _process_attack(delta: float) -> void:
	if not target_player:
		current_state = State.PATROL
		return

	# Stop horizontal movement while attacking
	velocity.x = 0.0
	velocity.z = 0.0

	var dir_to_player: Vector3 = (target_player.global_position - global_position).normalized()
	_face_direction(dir_to_player)

	var dist: float = global_position.distance_to(target_player.global_position)
	if dist > attack_range * 1.3:
		current_state = State.CHASE
		return

	attack_timer += delta
	if attack_timer >= attack_rate:
		attack_timer = 0.0
		_execute_attack()


func _execute_attack() -> void:
	# Deal damage to player through GameManager
	GameManager.apply_player_damage(attack_damage)

	# Quick forward punch tween
	var orig_pos: Vector3 = mesh_instance.position
	var punch_tween: Tween = create_tween()
	punch_tween.tween_property(mesh_instance, "position", orig_pos + Vector3(0.0, 0.0, -0.4), 0.08)
	punch_tween.tween_property(mesh_instance, "position", orig_pos, 0.15)


func _face_direction(dir: Vector3) -> void:
	var look_dir: Vector3 = Vector3(dir.x, 0.0, dir.z)
	if look_dir.length_squared() > 0.001:
		var target_yaw: float = atan2(-look_dir.x, -look_dir.z)
		rotation.y = lerp_angle(rotation.y, target_yaw, 0.15)


func _pick_new_patrol_target() -> void:
	var random_offset: Vector2 = Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)).normalized() * randf_range(3.0, patrol_radius)
	current_patrol_target = home_position + Vector3(random_offset.x, 0.0, random_offset.y)


## -----------------------------------------------------------------------------
## The Ricochet Damage Rule Implementation
## -----------------------------------------------------------------------------
## Called ONLY by Charged Lethal bullets (Bounced at least once)
func take_damage(amount: int, _hit_point: Vector3, hit_direction: Vector3, bounces: int) -> void:
	if current_state == State.DEAD:
		return

	current_health -= amount
	enemy_damaged.emit(current_health, max_health)

	# Knockback
	velocity += hit_direction * 7.5

	# Visual crimson damage flash
	_flash_damage()

	if current_health <= 0:
		_die(bounces)


## Called when struck by a direct, uncharged bullet
func on_deflect(_hit_point: Vector3) -> void:
	if current_state == State.DEAD:
		return

	# Flash defensive cyan energy shield to communicate 0 damage
	_flash_deflection_shield()


func _flash_damage() -> void:
	if not body_material:
		return
	var orig_color: Color = body_material.albedo_color
	var flash_tween: Tween = create_tween()
	flash_tween.tween_property(body_material, "albedo_color", Color(1.0, 0.0, 0.2), 0.04)
	flash_tween.tween_property(body_material, "emission", Color(1.0, 0.1, 0.3), 0.04)
	flash_tween.tween_property(body_material, "emission_energy_multiplier", 4.0, 0.04)
	flash_tween.tween_property(body_material, "albedo_color", orig_color, 0.2)
	flash_tween.tween_property(body_material, "emission_energy_multiplier", 0.0, 0.2)


func _flash_deflection_shield() -> void:
	if not shield_mesh:
		return
	shield_mesh.visible = true
	var shield_tween: Tween = create_tween()
	shield_tween.tween_property(shield_mesh, "scale", Vector3(1.2, 1.2, 1.2), 0.08)
	shield_tween.tween_property(shield_mesh, "scale", Vector3(0.01, 0.01, 0.01), 0.15)
	shield_tween.tween_callback(func(): shield_mesh.visible = false)


func _die(bounces: int) -> void:
	current_state = State.DEAD
	set_physics_process(false)
	if collision_shape:
		collision_shape.set_deferred("disabled", true)

	enemy_died.emit(bounces)
	GameManager.record_kill(bounces)

	# Death dissolution animation
	var death_tween: Tween = create_tween().set_parallel(true)
	death_tween.tween_property(mesh_instance, "scale", Vector3.ZERO, 0.4).set_ease(Tween.EASE_IN)
	death_tween.tween_property(mesh_instance, "position:y", position.y - 0.8, 0.4)
	death_tween.chain().tween_callback(queue_free)


func _setup_materials() -> void:
	if mesh_instance:
		var base_mat: StandardMaterial3D = StandardMaterial3D.new()
		base_mat.albedo_color = Color(0.18, 0.2, 0.25)
		base_mat.metallic = 0.5
		base_mat.roughness = 0.4
		base_mat.emission_enabled = true
		base_mat.emission = Color(0.0, 0.0, 0.0)
		body_material = base_mat
		mesh_instance.material_override = body_material

