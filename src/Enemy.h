#include "raylib.h"
#include "BaseCharacter.h"
#include "Character.h"

class Enemy : public BaseCharacter
{
public:
    Enemy(Vector2 pos, Texture2D idle_texture, Texture2D run_texture, float enemySpeed);
    virtual void tick(float deltaTime) override;
    void setTarget(Character* input) { target = input; };
    virtual Vector2 getScreenPos() override;
private:
    Sound enemyKilled = LoadSound("nature_tileset/21_orc_damage_3.wav");
    Character* target;
    float damagePerSec{12.f};
    float radius{25.f};
    bool killed{false};
};
