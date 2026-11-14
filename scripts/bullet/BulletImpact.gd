extends Node3D
class_name BulletImpact

## ==============================================================================
## BulletImpact - Spawns visual sparks & dynamic light flashes for bullet hits.
## Supports both UNCHARGED (Cyan) and LETHAL (Crimson) themes.
## ==============================================================================

@onready var particles: GPUParticles3D = $GPUParticles3D
@onready var flash_light: OmniLight3D = $OmniLight3D

const COLOR_CYAN = Color(0.0, 0.94, 1.0, 1.0)       # #00F0FF
const COLOR_CRIMSON = Color(1.0, 0.05, 0.28, 1.0)   # #FF0D47


func setup(is_lethal: bool, normal: Vector3 = Vector3.UP) -> void:
	if normal != Vector3.ZERO:
		look_at(global_position + normal, Vector3.UP if abs(normal.y) < 0.9 else Vector3.RIGHT)

	var target_color: Color = COLOR_CRIMSON if is_lethal else COLOR_CYAN

	if flash_light:
		flash_light.light_color = target_color
		flash_light.light_energy = 5.0 if is_lethal else 2.5

	if particles:
		var mat: ParticleProcessMaterial = particles.process_material as ParticleProcessMaterial
		if mat:
			mat = mat.duplicate() as ParticleProcessMaterial
			mat.color = target_color
			particles.process_material = mat
		particles.emitting = true

	# Fade out dynamic light
	var tween: Tween = create_tween()
	tween.tween_property(flash_light, "light_energy", 0.0, 0.35)
	tween.tween_callback(queue_free).set_delay(0.5)

