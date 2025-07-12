#include "Character.h"
#include "raylib.h"
#include "raymath.h"

Character::Character(int winWidth, int winHeight, Texture2D idleTexture, Texture2D runTexture):
    BaseCharacter(idleTexture, runTexture),
    windowWidth(winWidth),
    windowHeight(winHeight)
{
    width = texture.width/maxFrames;
    height = texture.height;

    SetSoundVolume(stride, 0.8f);
    SetSoundVolume(attack, 0.65f);
    // set the tempo of the stride and the attack
    SetSoundPitch(stride, 2.05f);
    SetSoundPitch(attack, 1.8f);

}

Vector2 Character::getScreenPos()
{
    return Vector2{
        static_cast<float>(windowWidth) / 2.0f - scale * (0.5f * width),
        static_cast<float>(windowHeight) / 2.0f - scale * (0.5f * height)
    };
}

void Character::tick(float deltaTime)
{
    if (!getAlive()) return;

    if (IsKeyDown(KEY_A))
        velocity.x -= 1.0;
    if (IsKeyDown(KEY_D))
        velocity.x += 1.0;
    if (IsKeyDown(KEY_W))
        velocity.y -= 1.0;
    if (IsKeyDown(KEY_S))
        velocity.y += 1.0;
        
    if (IsKeyDown(KEY_A) || IsKeyDown(KEY_D) || IsKeyDown(KEY_W) || IsKeyDown(KEY_S))
    {
        if (!IsSoundPlaying(stride))
            PlaySound(stride);
        else
            ResumeSound(stride);
    }
    
    BaseCharacter::tick(deltaTime);

    Vector2 origin{};
    Vector2 offset{};
    float rotation{};
    
    if (rightLeft > 0.f)
    {
        origin = {0.f, weapon.height * scale};
        offset = {45.f, 70.f};
        weaponCollisionRec = {
            getScreenPos().x + offset.x,
            getScreenPos().y + offset.y - weapon.height * scale,
            weapon.width * scale,
            weapon.height * scale
        };
        rotation = IsKeyDown(KEY_SPACE) ? 35.f : 0.f;
    }
    else
    {
        origin = {weapon.width * scale, weapon.height * scale};
        offset = {35.f, 70.f};
        weaponCollisionRec = {
            getScreenPos().x + offset.x - weapon.width * scale,
            getScreenPos().y + offset.y - weapon.height * scale,
            weapon.width * scale,
            weapon.height * scale
        };
        rotation = IsKeyDown(KEY_SPACE) ? -35.f : 0.f;
    }

    if (IsKeyDown(KEY_SPACE))
    {
        if (!IsSoundPlaying(attack))
            PlaySound(attack);
        else
            ResumeSound(attack);
    }
    
    // draw the sworde
    Rectangle source{0.f, 0.f, static_cast<float>(weapon.width) * rightLeft, static_cast<float>(weapon.height)};
    Rectangle dest{getScreenPos().x + offset.x, getScreenPos().y + offset.y, weapon.width * 3.f, weapon.height * 3.f};
    DrawTexturePro(weapon, source, dest, origin, rotation, WHITE);
}

