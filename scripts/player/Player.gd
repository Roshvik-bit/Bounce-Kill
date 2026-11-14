extends CharacterBody3D
class_name Player

## ==============================================================================
## Bounce Kill - Player Controller (CharacterBody3D)
##
## Features:
## - Full FPS locomotion (WASD, Sprint, Jump, Gravity).
## - Mouse-look with clamped vertical pitch.
## - Semi-auto Ricochet Pistol with physical bullet instantiation.
## - Integrated laser trajectory prediction hint.
## - Procedural weapon kickback & recoil.
## ==============================================================================

signal ammo_updated(current_ammo: int, max_ammo: int)
signal weapon_fired()
signal weapon_reloaded()

@export_group("Movement Parameters")
@export var walk_speed: float = 7.0
@export var sprint_speed: float = 11.0
@export var jump_velocity: float = 4.8
@export var acceleration: float = 12.0
@export var friction: float = 10.0
@export var mouse_sensitivity: float = 0.0022

@export_group("Weapon System")
@export var bullet_scene: PackedScene
@export var max_ammo: int = 6
@export var fire_cooldown: float = 0.22
@export var reload_time: float = 1.2

# Weapon runtime state
var current_ammo: int = 6
var can_fire: bool = true
var is_reloading: bool = false
var fire_timer: float = 0.0

# Gravity from project settings
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

# Node hierarchy references
@onready var head: Node3D = $Head
@onready var camera: Camera3D = $Head/Camera3D
@onready var gun_anchor: Node3D = $Head/Camera3D/GunAnchor
@onready var muzzle: Marker3D = $Head/Camera3D/GunAnchor/PistolMesh/Muzzle
@onready var muzzle_flash_light: OmniLight3D = $Head/Camera3D/GunAnchor/PistolMesh/MuzzleFlashLight
@onready var gun_audio: AudioStreamPlayer3D = $Head/Camera3D/GunAnchor/GunAudio
@onready var laser_predictor: LaserPredictor = $Head/Camera3D/LaserPredictor

# Original weapon position for recoil recovery
var gun_rest_pos: Vector3


func _ready() -> void:
	# Capture mouse cursor for FPS gameplay
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	current_ammo = max_ammo
	ammo_updated.emit(current_ammo, max_ammo)

	if gun_anchor:
		gun_rest_pos = gun_anchor.position


func _unhandled_input(event: InputEvent) -> void:
	# Mouse look handling
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		camera.rotate_x(-event.relative.y * mouse_sensitivity)
		camera.rotation.x = clampf(camera.rotation.x, deg_to_rad(-89.0), deg_to_rad(89.0))

	# Toggle mouse lock for debugging / menus
	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

	# Left-click to recapture mouse if released
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		if Input.get_mouse_mode() == Input.MOUSE_MODE_VISIBLE:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func _physics_process(delta: float) -> void:
	_handle_movement(delta)
	_handle_weapon_timers(delta)
	_update_laser_prediction()


## -----------------------------------------------------------------------------
## Locomotion & Physics
## -----------------------------------------------------------------------------
func _handle_movement(delta: float) -> void:
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Jump handling
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity

	# Input movement vector (WASD)
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	var target_speed: float = sprint_speed if Input.is_action_pressed("sprint") else walk_speed

	# Calculate world direction relative to player rotation
	var wish_dir: Vector3 = (transform.basis * Vector3(input_dir.x, 0.0, input_dir.y)).normalized()

	if wish_dir.length_squared() > 0.001:
		# Accelerate
		velocity.x = lerpf(velocity.x, wish_dir.x * target_speed, acceleration * delta)
		velocity.z = lerpf(velocity.z, wish_dir.z * target_speed, acceleration * delta)
	else:
		# Apply friction deceleration
		velocity.x = lerpf(velocity.x, 0.0, friction * delta)
		velocity.z = lerpf(velocity.z, 0.0, friction * delta)

	move_and_slide()


## -----------------------------------------------------------------------------
## Weapon System & Ricochet Firing
## -----------------------------------------------------------------------------
func _handle_weapon_timers(delta: float) -> void:
	# Manage rate of fire cooldown
	if not can_fire:
		fire_timer -= delta
		if fire_timer <= 0.0:
			can_fire = true

	# Fire input
	if Input.is_action_just_pressed("fire"):
		if can_fire and not is_reloading:
			if current_ammo > 0:
				_shoot()
			else:
				_start_reload()

	# Manual reload input
	if Input.is_action_just_pressed("reload") and not is_reloading and current_ammo < max_ammo:
		_start_reload()


func _shoot() -> void:
	can_fire = false
	fire_timer = fire_cooldown
	current_ammo -= 1
	ammo_updated.emit(current_ammo, max_ammo)

	# 1. Determine aim point by casting from center of screen (Camera forward)
	var screen_center_ray: Vector3 = -camera.global_transform.basis.z
	var ray_start: Vector3 = camera.global_position
	var ray_end: Vector3 = ray_start + screen_center_ray * 150.0

	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(ray_start, ray_end)
	query.collision_mask = 1 | 4 # Layer 1 (Environment), Layer 3 (Enemies)
	query.exclude = [get_rid()] # Exclude player body

	var hit: Dictionary = space_state.intersect_ray(query)
	var target_point: Vector3 = hit.position if not hit.is_empty() else ray_end

	# 2. Instantiate and launch the Ricochet Bullet
	if bullet_scene:
		var bullet: Bullet = bullet_scene.instantiate() as Bullet
		get_tree().root.add_child(bullet)

		var spawn_pos: Vector3 = muzzle.global_position if muzzle else ray_start
		var shoot_dir: Vector3 = (target_point - spawn_pos).normalized()

		bullet.global_position = spawn_pos
		bullet.velocity = shoot_dir * bullet.speed
		if shoot_dir.length_squared() > 0.001:
			bullet.look_at(spawn_pos + shoot_dir, Vector3.UP)

	# 3. Audio & Visual Juice
	_play_gunshot()
	_apply_recoil()
	weapon_fired.emit()

	# Auto reload if magazine empty
	if current_ammo <= 0:
		_start_reload()


func _start_reload() -> void:
	if is_reloading:
		return
	is_reloading = true

	# Weapon drop reload animation via Tween
	var reload_tween: Tween = create_tween()
	reload_tween.tween_property(gun_anchor, "position:y", gun_rest_pos.y - 0.25, reload_time * 0.4)
	reload_tween.tween_interval(reload_time * 0.2)
	reload_tween.tween_property(gun_anchor, "position:y", gun_rest_pos.y, reload_time * 0.4)
	reload_tween.tween_callback(func():
		current_ammo = max_ammo
		is_reloading = false
		ammo_updated.emit(current_ammo, max_ammo)
		weapon_reloaded.emit()
	)


func _apply_recoil() -> void:
	if not gun_anchor:
		return

	var kick_offset: Vector3 = Vector3(0.0, 0.04, 0.12)
	var recoil_tween: Tween = create_tween()
	recoil_tween.tween_property(gun_anchor, "position", gun_rest_pos + kick_offset, 0.04)
	recoil_tween.tween_property(gun_anchor, "position", gun_rest_pos, 0.16).set_ease(Tween.EASE_OUT)


func _play_gunshot() -> void:
	if gun_audio and gun_audio.stream:
		gun_audio.pitch_scale = randf_range(0.95, 1.05)
		gun_audio.play()

	if muzzle_flash_light:
		muzzle_flash_light.light_energy = 3.5
		var flash_tween: Tween = create_tween()
		flash_tween.tween_property(muzzle_flash_light, "light_energy", 0.0, 0.06)


## -----------------------------------------------------------------------------
## Laser Trajectory Prediction Hint
## -----------------------------------------------------------------------------
func _update_laser_prediction() -> void:
	if not laser_predictor:
		return
	var origin: Vector3 = camera.global_position + (-camera.global_transform.basis.z * 0.3)
	var forward: Vector3 = -camera.global_transform.basis.z
	laser_predictor.update_prediction(origin, forward)

