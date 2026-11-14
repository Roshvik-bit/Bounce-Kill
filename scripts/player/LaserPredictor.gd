extends Node3D
class_name LaserPredictor

## ==============================================================================
## LaserPredictor - 3D Trajectory & Ricochet Prediction Beam
##
## Casts a 2-segment ray into the world:
## Segment 1: Muzzle -> First Wall Collision (Uncharged Cyan)
## Segment 2: Wall Reflection -> Next target (Crimson if hitting enemy!)
## ==============================================================================

signal prediction_updated(has_lethal_target: bool, hit_direct_enemy: bool, bounce_pos: Vector3)

@export var max_range: float = 60.0
@export var bounce_range: float = 40.0
@export var show_laser_mesh: bool = true

const COLOR_CYAN = Color(0.0, 0.94, 1.0, 0.85)       # #00F0FF
const COLOR_CRIMSON = Color(1.0, 0.05, 0.28, 0.95)   # #FF0D47

var mesh_instance: MeshInstance3D
var immediate_mesh: ImmediateMesh
var laser_material: StandardMaterial3D

var has_lethal_aim: bool = false
var hits_direct_enemy: bool = false


func _ready() -> void:
	_setup_visuals()


func _setup_visuals() -> void:
	if not show_laser_mesh:
		return

	immediate_mesh = ImmediateMesh.new()
	mesh_instance = MeshInstance3D.new()
	mesh_instance.mesh = immediate_mesh
	mesh_instance.top_level = true # Render in global coordinates

	laser_material = StandardMaterial3D.new()
	laser_material.shading_mode = StandardMaterial3D.SHADING_MODE_UNSHADED
	laser_material.vertex_color_use_as_albedo = true
	laser_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	laser_material.emission_enabled = true
	laser_material.emission_energy_multiplier = 2.0
	mesh_instance.material_override = laser_material

	add_child(mesh_instance)


func update_prediction(origin: Vector3, forward_dir: Vector3) -> void:
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	if not space_state:
		return

	has_lethal_aim = false
	hits_direct_enemy = false

	# Segment 1: Direct path from gun/camera
	var seg1_end: Vector3 = origin + forward_dir * max_range
	var query1: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(origin, seg1_end)
	# Collision masks: 1 = Environment, 3 = Enemies
	query1.collision_mask = 1 | 4 # Bitmask: layer 1 (1) and layer 3 (4)

	var hit1: Dictionary = space_state.intersect_ray(query1)

	var p0: Vector3 = origin
	var p1: Vector3 = seg1_end
	var p2: Vector3 = Vector3.ZERO
	var has_bounce: bool = false
	var c1: Color = COLOR_CYAN
	var c2: Color = COLOR_CYAN

	if not hit1.is_empty():
		p1 = hit1.position
		var collider: Object = hit1.collider

		if collider and (collider.is_in_group("enemies") or collider.has_method("take_damage")):
			# Direct hit warning! Ricochet rule prevents damage!
			hits_direct_enemy = true
			c1 = Color(0.3, 0.7, 0.9, 0.4) # Dim cyan dud warning
		else:
			# Wall hit! Calculate bounce segment
			has_bounce = true
			var normal: Vector3 = hit1.normal
			var reflect_dir: Vector3 = forward_dir.bounce(normal).normalized()
			var seg2_end: Vector3 = p1 + reflect_dir * bounce_range

			var query2: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(p1 + normal * 0.05, seg2_end)
			query2.collision_mask = 1 | 4 # Check walls & enemies
			var hit2: Dictionary = space_state.intersect_ray(query2)

			if not hit2.is_empty():
				p2 = hit2.position
				var collider2: Object = hit2.collider
				if collider2 and (collider2.is_in_group("enemies") or collider2.has_method("take_damage")):
					# LETHAL BANK SHOT ALIGNED!
					has_lethal_aim = true
					c2 = COLOR_CRIMSON
			else:
				p2 = seg2_end

	# Draw lines using ImmediateMesh
	if show_laser_mesh and immediate_mesh:
		immediate_mesh.clear_surfaces()
		immediate_mesh.surface_begin(Mesh.PRIMITIVE_LINES)

		# Segment 1
		immediate_mesh.surface_set_color(c1)
		immediate_mesh.surface_add_vertex(p0)
		immediate_mesh.surface_set_color(c1)
		immediate_mesh.surface_add_vertex(p1)

		# Segment 2 (Bounce)
		if has_bounce:
			immediate_mesh.surface_set_color(c2)
			immediate_mesh.surface_add_vertex(p1)
			immediate_mesh.surface_set_color(c2)
			immediate_mesh.surface_add_vertex(p2)

		immediate_mesh.surface_end()

	prediction_updated.emit(has_lethal_aim, hits_direct_enemy, p1 if has_bounce else Vector3.ZERO)

