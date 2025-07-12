#include "raylib.h"
#include "BaseCharacter.h"
#include "raymath.h"

BaseCharacter::BaseCharacter()
{
    
}

BaseCharacter::BaseCharacter(Texture2D idleTexture, Texture2D runTexture)
{
    idle = idleTexture;
    run = runTexture;
    texture = idle;
}

void BaseCharacter::undoMovement()
{
    worldPos = worldPosLastFrame;
}

Rectangle BaseCharacter::getCollisionRec()
{
    return Rectangle{
        getScreenPos().x,
        getScreenPos().y,
        width * scale,
        texture.height * scale
    };
}

void BaseCharacter::tick(float deltaTime)
{
    worldPosLastFrame = worldPos;

    bool isMoving = (Vector2Length(velocity) != 0.0);
    
    // Always update animation timing
    runningTime += deltaTime;
    
    // Handle movement and texture switching more carefully
    if (isMoving)
    {
        // set worldPos = worldPos + direction
        worldPos = Vector2Add(worldPos, Vector2Scale(Vector2Normalize(velocity), speed));
        velocity.x < 0.f ? rightLeft = -1.f : rightLeft = 1.f;
        
        // Only change texture and reset animation if we weren't moving before
        if (!wasMoving)
        {
            texture = run;
            frame = 0;
            runningTime = 0.f;
        }
        else 
        {
            texture = run;
        }
        
        // Update animation frame only when moving
        if (runningTime >= updateTime)
        {
            frame++;
            runningTime = 0.f;
            // Fix: if we have 6 frames (0,1,2,3,4,5), reset at frame 6
            if (frame >= maxFrames)
                frame = 0;
        }
    }
    else
    {
        // Only change texture and reset animation if we were moving before
        if (wasMoving)
        {
            texture = idle;
            frame = 0;
            runningTime = 0.f;
        }
        else 
        {
            texture = idle;
        }
        
        // Keep idle animation running but slower
        if (runningTime >= updateTime * 3.0f) // Much slower idle animation
        {
            frame++;
            runningTime = 0.f;
            // Fix: if we have 6 frames (0,1,2,3,4,5), reset at frame 6
            if (frame >= maxFrames)
                frame = 0;
        }
    }
    
    wasMoving = isMoving;
    velocity = {};
    
    // draw the character with better safety checks
    if (frame < 0) frame = 0;
    if (frame >= maxFrames) frame = 0; // Reset to 0 if out of bounds
    
    Rectangle source{frame * width, 0.f, rightLeft * width, height};
    Rectangle dest{getScreenPos().x, getScreenPos().y, scale * width, scale * height};
    DrawTexturePro(texture, source, dest, Vector2{}, 0.f, WHITE);
}

void BaseCharacter::takeDamage(float damage)
{
    health -= damage;
    if (health <= 0.f)
    {
        health = 0.f;
        setAlive(false);
    }
}
