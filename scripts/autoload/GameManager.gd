extends Node

## ==============================================================================
## Bounce Kill - GameManager (Autoload Singleton)
## Manages global game state, player vital stats, bank shot combo multipliers,
## and level progression.
## ==============================================================================

signal health_changed(current_health: int, max_health: int)
signal score_changed(total_score: int, added_score: int, multiplier: float)
signal combo_updated(multiplier: float, time_left: float, max_time: float)
signal combo_ended()
signal game_state_changed(new_state: GameState)
signal bank_shot_achieved(bounces: int, score_earned: int, multiplier: float)

enum GameState {
	PLAYING,
	PAUSED,
	GAME_OVER,
	VICTORY
}

## Game balance configuration
@export_group("Player Stats")
@export var max_health: int = 100
var current_health: int = 100

@export_group("Scoring & Combos")
@export var base_kill_score: int = 100
@export var combo_duration: float = 4.5 # Seconds before combo resets
var score: int = 0
var current_combo_multiplier: float = 1.0
var combo_timer: float = 0.0

@export_group("Level State")
var current_state: GameState = GameState.PLAYING
var total_enemies: int = 0
var enemies_remaining: int = 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	reset_game()


func _process(delta: float) -> void:
	if current_state != GameState.PLAYING:
		return

	# Ticking down active combo window
	if combo_timer > 0.0:
		combo_timer -= delta
		combo_updated.emit(current_combo_multiplier, combo_timer, combo_duration)
		if combo_timer <= 0.0:
			_reset_combo()


## -----------------------------------------------------------------------------
## Health Management
## -----------------------------------------------------------------------------
func apply_player_damage(amount: int) -> void:
	if current_state != GameState.PLAYING:
		return

	current_health = clampi(current_health - amount, 0, max_health)
	health_changed.emit(current_health, max_health)

	if current_health <= 0:
		set_game_state(GameState.GAME_OVER)


func heal_player(amount: int) -> void:
	if current_state != GameState.PLAYING:
		return

	current_health = clampi(current_health + amount, 0, max_health)
	health_changed.emit(current_health, max_health)


## -----------------------------------------------------------------------------
## Ricochet Combo & Scoring System
## -----------------------------------------------------------------------------
## Multiplier formula:
## 1 Bounce  -> 1.0x (Baseline Lethal)
## 2 Bounces -> 2.0x (Double Bank)
## 3 Bounces -> 3.5x (Trick Shot)
## 4+ Bounces -> 5.0x + (Master Shot)
func calculate_bounce_bonus(bounces: int) -> float:
	match bounces:
		1:
			return 1.0
		2:
			return 2.0
		3:
			return 3.5
		_:
			return 5.0 + float(bounces - 4) * 1.5


func record_kill(bounces: int) -> void:
	if current_state != GameState.PLAYING:
		return

	# Calculate bounce factor and stack onto the player's active combo
	var bounce_factor: float = calculate_bounce_bonus(bounces)
	current_combo_multiplier = snappedf(current_combo_multiplier + (bounce_factor - 1.0) * 0.5, 0.1)
	if current_combo_multiplier < 1.0:
		current_combo_multiplier = 1.0

	var added_score: int = int(round(float(base_kill_score) * bounce_factor * current_combo_multiplier))
	score += added_score

	# Refresh combo timer
	combo_timer = combo_duration

	# Emit notifications
	bank_shot_achieved.emit(bounces, added_score, current_combo_multiplier)
	score_changed.emit(score, added_score, current_combo_multiplier)
	combo_updated.emit(current_combo_multiplier, combo_timer, combo_duration)

	# Decrement enemy tracker
	enemies_remaining = maxi(0, enemies_remaining - 1)
	if enemies_remaining == 0 and total_enemies > 0:
		set_game_state(GameState.VICTORY)


func _reset_combo() -> void:
	current_combo_multiplier = 1.0
	combo_timer = 0.0
	combo_ended.emit()


## -----------------------------------------------------------------------------
## Enemy Tracking & Progression
## -----------------------------------------------------------------------------
func register_enemy() -> void:
	total_enemies += 1
	enemies_remaining += 1


func unregister_enemy_without_kill() -> void:
	enemies_remaining = maxi(0, enemies_remaining - 1)
	if enemies_remaining == 0 and total_enemies > 0:
		set_game_state(GameState.VICTORY)


## -----------------------------------------------------------------------------
## Game State Control
## -----------------------------------------------------------------------------
func set_game_state(new_state: GameState) -> void:
	current_state = new_state
	game_state_changed.emit(new_state)

	match new_state:
		GameState.GAME_OVER, GameState.VICTORY:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		GameState.PLAYING:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func reset_game() -> void:
	current_health = max_health
	score = 0
	_reset_combo()
	total_enemies = 0
	enemies_remaining = 0
	set_game_state(GameState.PLAYING)
	health_changed.emit(current_health, max_health)
	score_changed.emit(score, 0, 1.0)


func restart_level() -> void:
	reset_game()
	get_tree().reload_current_scene()

