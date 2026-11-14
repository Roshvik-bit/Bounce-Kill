extends CanvasLayer
class_name HUD

## ==============================================================================
## Bounce Kill - Cyberpunk HUD (CanvasLayer)
## Theme: #00F0FF (Cyan) & #FF0D47 (Crimson)
##
## Displays:
## - Dynamic Crosshair with Ricochet Lethal / Dud Prediction Indicators
## - Health Bar with Crimson damage flash
## - Ammo Counter with reload state
## - Bank Shot Combo Multiplier & Floating Kill Banners
## - Game Over / Victory Overlays
## ==============================================================================

const COLOR_CYAN = Color(0.0, 0.94, 1.0, 1.0)       # #00F0FF
const COLOR_CRIMSON = Color(1.0, 0.05, 0.28, 1.0)   # #FF0D47
const COLOR_MUTED = Color(0.4, 0.5, 0.6, 0.8)

# Health & Ammo UI
@onready var health_bar: ProgressBar = $Root/BottomLeft/VBox/HealthBar
@onready var health_label: Label = $Root/BottomLeft/VBox/HealthLabel
@onready var ammo_label: Label = $Root/BottomRight/AmmoContainer/AmmoLabel
@onready var ammo_subtext: Label = $Root/BottomRight/AmmoContainer/SubLabel

# Score & Combo UI
@onready var score_label: Label = $Root/TopRight/ScoreLabel
@onready var combo_container: VBoxContainer = $Root/TopRight/ComboContainer
@onready var combo_label: Label = $Root/TopRight/ComboContainer/ComboLabel
@onready var combo_bar: ProgressBar = $Root/TopRight/ComboContainer/ComboBar

# Crosshair & Aim Prediction
@onready var crosshair_root: Control = $Root/Center/Crosshair
@onready var reticle_dot: ColorRect = $Root/Center/Crosshair/Dot
@onready var reticle_top: ColorRect = $Root/Center/Crosshair/Top
@onready var reticle_bottom: ColorRect = $Root/Center/Crosshair/Bottom
@onready var reticle_left: ColorRect = $Root/Center/Crosshair/Left
@onready var reticle_right: ColorRect = $Root/Center/Crosshair/Right
@onready var prediction_label: Label = $Root/Center/PredictionLabel

# Bank Shot Banner
@onready var banner_label: Label = $Root/TopCenter/BankShotBanner

# End Screen
@onready var end_screen: Control = $Root/EndScreen
@onready var end_title: Label = $Root/EndScreen/Panel/VBox/TitleLabel
@onready var end_score: Label = $Root/EndScreen/Panel/VBox/FinalScoreLabel
@onready var restart_button: Button = $Root/EndScreen/Panel/VBox/RestartButton


func _ready() -> void:
	# Connect to GameManager autoload signals
	GameManager.health_changed.connect(_on_health_changed)
	GameManager.score_changed.connect(_on_score_changed)
	GameManager.combo_updated.connect(_on_combo_updated)
	GameManager.combo_ended.connect(_on_combo_ended)
	GameManager.game_state_changed.connect(_on_game_state_changed)
	GameManager.bank_shot_achieved.connect(_on_bank_shot_achieved)

	# Connect restart button
	restart_button.pressed.connect(GameManager.restart_level)

	# Connect to Player signals if player exists
	_connect_player_signals()

	# Initial setup
	_on_health_changed(GameManager.current_health, GameManager.max_health)
	_on_score_changed(GameManager.score, 0, 1.0)
	_on_combo_ended()
	banner_label.modulate.a = 0.0
	end_screen.visible = false
	_set_crosshair_color(COLOR_CYAN)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("reset"):
		GameManager.restart_level()


func _connect_player_signals() -> void:
	var players: Array[Node] = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var p: Player = players[0] as Player
		p.ammo_updated.connect(_on_ammo_updated)
		if p.laser_predictor:
			p.laser_predictor.prediction_updated.connect(_on_prediction_updated)


## -----------------------------------------------------------------------------
## Signal Handlers (Vitals & Scoring)
## -----------------------------------------------------------------------------
func _on_health_changed(current: int, max_hp: int) -> void:
	if health_bar:
		health_bar.max_value = max_hp
		health_bar.value = current
	if health_label:
		health_label.text = "HP: %d / %d" % [current, max_hp]

	# Crimson flash when taking damage
	if current < max_hp:
		var flash_tween: Tween = create_tween()
		flash_tween.tween_property(health_bar, "modulate", COLOR_CRIMSON, 0.05)
		flash_tween.tween_property(health_bar, "modulate", COLOR_CYAN, 0.25)


func _on_ammo_updated(current: int, max_bullets: int) -> void:
	if not ammo_label:
		return
	ammo_label.text = "%d / %d" % [current, max_bullets]

	if current == 0:
		ammo_label.modulate = COLOR_CRIMSON
		ammo_subtext.text = "RELOADING..."
		ammo_subtext.modulate = COLOR_CRIMSON
	else:
		ammo_label.modulate = COLOR_CYAN
		ammo_subtext.text = "RICOCHET ROUNDS"
		ammo_subtext.modulate = COLOR_MUTED


func _on_score_changed(total: int, _added: int, _multiplier: float) -> void:
	if score_label:
		score_label.text = "SCORE: %s" % _format_number(total)


func _on_combo_updated(multiplier: float, time_left: float, max_time: float) -> void:
	combo_container.visible = true
	combo_label.text = "COMBO: x%.1f" % multiplier
	combo_bar.max_value = max_time
	combo_bar.value = time_left

	# High combo multiplier pulses with crimson energy
	if multiplier >= 2.0:
		combo_label.modulate = COLOR_CRIMSON
		combo_bar.modulate = COLOR_CRIMSON
	else:
		combo_label.modulate = COLOR_CYAN
		combo_bar.modulate = COLOR_CYAN


func _on_combo_ended() -> void:
	combo_container.visible = false


## -----------------------------------------------------------------------------
## Ricochet Prediction & Crosshair Reticle State
## -----------------------------------------------------------------------------
func _on_prediction_updated(has_lethal_target: bool, hit_direct_enemy: bool, _bounce_pos: Vector3) -> void:
	if has_lethal_target:
		# ======================================================================
		# LETHAL BANK SHOT ALIGNED: Reticle turns Crimson!
		# ======================================================================
		_set_crosshair_color(COLOR_CRIMSON)
		prediction_label.text = "⚡ RICOCHET LETHAL LOCKED"
		prediction_label.modulate = COLOR_CRIMSON
		prediction_label.visible = true

		# Dynamic reticle expansion
		crosshair_root.scale = Vector2(1.2, 1.2)
	elif hit_direct_enemy:
		# ======================================================================
		# DIRECT HIT WARNING: Reminds player of the Ricochet Rule!
		# ======================================================================
		_set_crosshair_color(COLOR_MUTED)
		prediction_label.text = "🚫 DIRECT HIT (0 DMG - RICOCHET REQUIRED)"
		prediction_label.modulate = Color(1.0, 0.4, 0.4, 0.9)
		prediction_label.visible = true
		crosshair_root.scale = Vector2(0.9, 0.9)
	else:
		# Standard aim: Default cyan
		_set_crosshair_color(COLOR_CYAN)
		prediction_label.visible = false
		crosshair_root.scale = Vector2.ONE


func _set_crosshair_color(col: Color) -> void:
	reticle_dot.color = col
	reticle_top.color = col
	reticle_bottom.color = col
	reticle_left.color = col
	reticle_right.color = col


## -----------------------------------------------------------------------------
## Kill Banner Announcement
## -----------------------------------------------------------------------------
func _on_bank_shot_achieved(bounces: int, points: int, multiplier: float) -> void:
	var title_text: String = ""
	var banner_color: Color = COLOR_CYAN

	match bounces:
		1:
			title_text = "BANK SHOT! +%d" % points
			banner_color = COLOR_CYAN
		2:
			title_text = "DOUBLE RICOCHET! +%d (x%.1f)" % [points, multiplier]
			banner_color = Color(1.0, 0.8, 0.1) # Amber / Gold
		3:
			title_text = "TRIPLE BANK SHOT! +%d (x%.1f)" % [points, multiplier]
			banner_color = COLOR_CRIMSON
		_:
			title_text = "MASTER TRICK SHOT (%dB)! +%d" % [bounces, points]
			banner_color = COLOR_CRIMSON

	banner_label.text = title_text
	banner_label.modulate = banner_color

	# Punchy pop-in animation
	var t: Tween = create_tween()
	t.tween_property(banner_label, "scale", Vector2(1.3, 1.3), 0.08)
	t.parallel().tween_property(banner_label, "modulate:a", 1.0, 0.08)
	t.tween_property(banner_label, "scale", Vector2(1.0, 1.0), 0.15)
	t.tween_interval(1.2)
	t.tween_property(banner_label, "modulate:a", 0.0, 0.35)


## -----------------------------------------------------------------------------
## Game Over / Victory
## -----------------------------------------------------------------------------
func _on_game_state_changed(new_state: GameManager.GameState) -> void:
	match new_state:
		GameManager.GameState.GAME_OVER:
			end_screen.visible = true
			end_title.text = "MISSION FAILED"
			end_title.modulate = COLOR_CRIMSON
			end_score.text = "FINAL SCORE: %s" % _format_number(GameManager.score)
		GameManager.GameState.VICTORY:
			end_screen.visible = true
			end_title.text = "SECTOR SECURED"
			end_title.modulate = COLOR_CYAN
			end_score.text = "FINAL SCORE: %s" % _format_number(GameManager.score)
		GameManager.GameState.PLAYING:
			end_screen.visible = false


func _format_number(val: int) -> String:
	var s: String = str(val)
	var out: String = ""
	var count: int = 0
	for i in range(s.length() - 1, -1, -1):
		out = s[i] + out
		count += 1
		if count % 3 == 0 and i > 0:
			out = "," + out
	return out

