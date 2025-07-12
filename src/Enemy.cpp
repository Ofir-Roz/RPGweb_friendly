#include "Enemy.h"
#include "raymath.h"

Enemy::Enemy(Vector2 pos, Texture2D idle_texture, Texture2D run_texture, float enemySpeed)
{
    worldPos = pos;
    texture = idle_texture;
    idle = idle_texture;
    run = run_texture;
    width = texture.width/maxFrames;
    height = texture.height;
    speed = enemySpeed;
    enemyType = GOBLIN; // Default type
    setupEnemyStats();
}

Enemy::Enemy(Vector2 pos, Texture2D idle_texture, Texture2D run_texture, float enemySpeed, EnemyType type)
{
    worldPos = pos;
    texture = idle_texture;
    idle = idle_texture;
    run = run_texture;
    width = texture.width/maxFrames;
    height = texture.height;
    speed = enemySpeed;
    enemyType = type;
    setupEnemyStats();
}

void Enemy::setupEnemyStats()
{
    switch(enemyType)
    {
        case GOBLIN:
            maxHealth = 100.f;
            health = maxHealth;
            damagePerSec = 12.f;
            radius = 25.f;
            break;
        case SLIME:
            maxHealth = 60.f;
            health = maxHealth;
            damagePerSec = 8.f;
            radius = 20.f;
            break;
        case INTELLECT_DEVOURER:
            maxHealth = 180.f;
            health = maxHealth;
            damagePerSec = 20.f;
            radius = 35.f;
            break;
        case ELITE_GOBLIN:
            maxHealth = 150.f;
            health = maxHealth;
            damagePerSec = 18.f;
            radius = 30.f;
            break;
        case SLIME_KING:
            maxHealth = 120.f;
            health = maxHealth;
            damagePerSec = 15.f;
            radius = 28.f;
            break;
    }
}

void Enemy::tick(float deltaTime)
{
    if (!getAlive()) {
        if (!IsSoundPlaying(enemyKilled) && !killed)
            PlaySound(enemyKilled);
        else 
            ResumeSound(enemyKilled);
            
        killed = true;
        return;
    }

    // get the velocity vector to the target
    velocity = Vector2Subtract(target->getScreenPos(), getScreenPos());
    float distanceToTarget = Vector2Length(velocity);
    
    // Different behaviors based on enemy type
    switch(enemyType)
    {
        case SLIME:
        case SLIME_KING:
            // Slimes stop further away and move more cautiously
            if (distanceToTarget < radius * 1.2f) velocity = {};
            break;
        case INTELLECT_DEVOURER:
            // Intellect Devourers are more aggressive and get closer
            if (distanceToTarget < radius * 0.8f) velocity = {};
            break;
        case ELITE_GOBLIN:
            // Elite goblins circle around the player sometimes
            if (distanceToTarget < radius * 1.5f && distanceToTarget > radius) {
                // Add some circular movement
                Vector2 perpendicular = {-velocity.y, velocity.x};
                velocity = Vector2Add(velocity, Vector2Scale(perpendicular, 0.3f));
            } else if (distanceToTarget < radius) {
                velocity = {};
            }
            break;
        default: // GOBLIN
            if (distanceToTarget < radius) velocity = {};
            break;
    }
    
    BaseCharacter::tick(deltaTime);

    if (CheckCollisionRecs(target->getCollisionRec(), getCollisionRec()))
    {
        target->takeDamage(damagePerSec * deltaTime);
    }
}

Vector2 Enemy::getScreenPos()
{
    return Vector2Subtract(worldPos, target->getWorldPos());
}
