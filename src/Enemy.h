#include "raylib.h"
#include "BaseCharacter.h"
#include "Character.h"

class Enemy : public BaseCharacter
{
public:
    enum EnemyType { GOBLIN, SLIME, INTELLECT_DEVOURER, ELITE_GOBLIN, SLIME_KING };
    
    Enemy(Vector2 pos, Texture2D idle_texture, Texture2D run_texture, float enemySpeed);
    Enemy(Vector2 pos, Texture2D idle_texture, Texture2D run_texture, float enemySpeed, EnemyType type);
    virtual ~Enemy() = default;
    virtual void tick(float deltaTime) override;
    void setTarget(Character* input) { target = input; };
    virtual Vector2 getScreenPos() override;
    EnemyType getType() const { return enemyType; }
private:
    Sound enemyKilled = LoadSound("nature_tileset/21_orc_damage_3.wav");
    Character* target;
    float damagePerSec{12.f};
    float radius{25.f};
    bool killed{false};
    EnemyType enemyType{GOBLIN};
    float maxHealth{100.f};
    
    void setupEnemyStats();
};
