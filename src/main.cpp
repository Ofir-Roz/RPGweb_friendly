#include "raylib.h"
#include "raymath.h"
#include "Character.h"
#include "Prop.h"
#include "Enemy.h"
#include "DynamicScreen.h"
#include <string>
#include <vector>
#include <memory>
#include <random>
#define SKYBLUEE    CLITERAL(Color){ 125, 210, 255, 255 }   // Sky Blue

int main()
{
    // window size in pixels 
    const int windowWidth{682};
    const int windowHeight{576};
    InitWindow(windowWidth, windowHeight, "Arachisya");
    InitAudioDevice();

    // Preload all textures to prevent flickering in web builds
    Texture2D goblinIdle = LoadTexture("characters/goblin_idle_spritesheet.png");
    Texture2D goblinRun = LoadTexture("characters/goblin_run_spritesheet.png");
    Texture2D slimeIdle = LoadTexture("characters/slime_idle_spritesheet.png");
    Texture2D slimeRun = LoadTexture("characters/slime_run_spritesheet.png");
    Texture2D intellectIdle = LoadTexture("characters/IntellectDevourerIdleSide_spritesheet.png");
    Texture2D knightIdle = LoadTexture("characters/knight_idle_spritesheet.png");
    Texture2D knightRun = LoadTexture("characters/knight_run_spritesheet.png");
    Texture2D rockTexture = LoadTexture("nature_tileset/Rock.png");
    Texture2D signTexture = LoadTexture("nature_tileset/Sign.png");
    Texture2D logTexture = LoadTexture("nature_tileset/Log.png");

    // some of the sound assets 
    Sound gameMusic = LoadSound("nature_tileset/Desecrated Cave ver.1.wav");
    Sound openingMusic = LoadSound("nature_tileset/A town without hope (no loop).wav");
    Sound defeatSound = LoadSound("nature_tileset/gameover_loud.mp3");
    SetSoundVolume(defeatSound, 0.2f);
    SetSoundPitch(defeatSound, 2.7f);
    bool played {false};

    Texture2D map = LoadTexture("nature_tileset/DesertWorldMap_2_24x24.png");
    Vector2 mapPos{0.0, 0.0};
    const float mapScale{4.0f};

    DynamicScreen openScreen;
    Texture2D openScreenBackground = LoadTexture("nature_tileset/Space_Background_fit.png");

    Character knight(windowWidth, windowHeight, knightIdle, knightRun);

    Prop props[6]{
        Prop{Vector2{800.f, 1200.f}, rockTexture, 7.f},
        Prop{Vector2{1450.f, 950.f}, signTexture, 4.f},
        Prop{Vector2{1800.f, 1650.f}, rockTexture, 10.f},
        Prop{Vector2{600.f, 700.f}, logTexture, 6.f},
        Prop{Vector2{1500.f, 300.f}, logTexture, 5.f},
        Prop{Vector2{2100.f, 500.f}, rockTexture, 6.5f}};

    // Dynamic enemy system
    std::vector<std::unique_ptr<Enemy>> enemies;
    
    // Random number generator for spawning
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> enemyTypeDist(0, 4); // 5 enemy types
    std::uniform_real_distribution<> posXDist(1200.f, 3300.f); // Bigger center area of map
    std::uniform_real_distribution<> posYDist(1000.f, 3000.f); // Bigger center area of map
    std::uniform_real_distribution<> speedDist(1.5f, 5.0f);
    
    // Function to spawn a random enemy
    auto spawnRandomEnemy = [&]() {
        Enemy::EnemyType type = static_cast<Enemy::EnemyType>(enemyTypeDist(gen));
        Vector2 spawnPos = {static_cast<float>(posXDist(gen)), static_cast<float>(posYDist(gen))};
        float speed = speedDist(gen);
        
        // Choose textures based on type
        Texture2D idleTexture, runTexture;
        switch(type) {
            case Enemy::GOBLIN:
            case Enemy::ELITE_GOBLIN:
                idleTexture = goblinIdle;
                runTexture = goblinRun;
                break;
            case Enemy::SLIME:
            case Enemy::SLIME_KING:
                idleTexture = slimeIdle;
                runTexture = slimeRun;
                break;
            case Enemy::INTELLECT_DEVOURER:
                idleTexture = intellectIdle;
                runTexture = intellectIdle;
                break;
        }
        
        auto newEnemy = std::make_unique<Enemy>(spawnPos, idleTexture, runTexture, speed, type);
        newEnemy->setTarget(&knight);
        enemies.push_back(std::move(newEnemy));
    };

    // Initial enemies
    enemies.push_back(std::make_unique<Enemy>(Vector2{1250.f, 350.f}, goblinIdle, goblinRun, 3.f, Enemy::GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{2700.f, 2500.f}, goblinIdle, goblinRun, 3.9f, Enemy::GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{3200.f, 250.f}, goblinIdle, goblinRun, 2.8f, Enemy::GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{3600.f, 2900.f}, goblinIdle, goblinRun, 3.2f, Enemy::GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{1800.f, 600.f}, goblinIdle, goblinRun, 2.5f, Enemy::GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{2200.f, 1200.f}, goblinIdle, goblinRun, 4.5f, Enemy::GOBLIN));
    
    enemies.push_back(std::make_unique<Enemy>(Vector2{1900.f, 3000.f}, slimeIdle, slimeRun, 1.7f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{1330.f, 2330.f}, slimeIdle, slimeRun, 2.9f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{500.f, 800.f}, slimeIdle, slimeRun, 1.2f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{3000.f, 3500.f}, slimeIdle, slimeRun, 3.8f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{900.f, 2800.f}, slimeIdle, slimeRun, 1.5f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{2500.f, 1800.f}, slimeIdle, slimeRun, 2.1f, Enemy::SLIME));
    enemies.push_back(std::make_unique<Enemy>(Vector2{1600.f, 1000.f}, slimeIdle, slimeRun, 1.9f, Enemy::SLIME));
    
    enemies.push_back(std::make_unique<Enemy>(Vector2{2670.f, 2900.f}, intellectIdle, intellectIdle, 2.2f, Enemy::INTELLECT_DEVOURER));
    enemies.push_back(std::make_unique<Enemy>(Vector2{4000.f, 1500.f}, intellectIdle, intellectIdle, 4.1f, Enemy::INTELLECT_DEVOURER));
    enemies.push_back(std::make_unique<Enemy>(Vector2{700.f, 1800.f}, intellectIdle, intellectIdle, 1.8f, Enemy::INTELLECT_DEVOURER));
    enemies.push_back(std::make_unique<Enemy>(Vector2{3800.f, 3200.f}, intellectIdle, intellectIdle, 3.5f, Enemy::INTELLECT_DEVOURER));
    
    enemies.push_back(std::make_unique<Enemy>(Vector2{4200.f, 800.f}, goblinIdle, goblinRun, 5.2f, Enemy::ELITE_GOBLIN));
    enemies.push_back(std::make_unique<Enemy>(Vector2{200.f, 3800.f}, goblinIdle, goblinRun, 4.8f, Enemy::ELITE_GOBLIN));
    
    enemies.push_back(std::make_unique<Enemy>(Vector2{4500.f, 2000.f}, slimeIdle, slimeRun, 2.5f, Enemy::SLIME_KING));
    enemies.push_back(std::make_unique<Enemy>(Vector2{300.f, 2200.f}, slimeIdle, slimeRun, 2.8f, Enemy::SLIME_KING));

    // Set target for all initial enemies
    for (auto& enemy : enemies) {
        enemy->setTarget(&knight);
    }

    // Enemy spawning timer
    float enemySpawnTimer = 0.0f;
    const float ENEMY_SPAWN_INTERVAL = 7.5f;

    SetTargetFPS(60);
    
    // Web build optimization - more stable timing
    #ifdef PLATFORM_WEB
        SetTargetFPS(60);
    #endif
    
    PlaySound(openingMusic);

    while (IsKeyUp(KEY_ENTER) && !WindowShouldClose())
    {
        BeginDrawing();
        ClearBackground(BLACK);

        DrawTextureEx(openScreenBackground, mapPos, 0.0, 1.f, WHITE);
        openScreen.Tick(GetFrameTime(), mapPos);

        if (!IsSoundPlaying(openingMusic))
            PlaySound(openingMusic);

        EndDrawing();
    }

    StopSound(openingMusic);

    PlaySound(gameMusic);

    while (!WindowShouldClose())
    {
        float deltaTime = GetFrameTime();
        
        // Clamp deltaTime for web stability - more aggressive
        #ifdef PLATFORM_WEB
            if (deltaTime > 0.033f) deltaTime = 0.016f; // Cap at ~30fps spike to 60fps
            if (deltaTime < 0.01f) deltaTime = 0.016f;  // Minimum frame time
        #endif
        
        BeginDrawing();
        ClearBackground(SKYBLUEE);

        mapPos = Vector2Scale(knight.getWorldPos(), -1.f);

        // draw the map
        DrawTextureEx(map, mapPos, 0.0, mapScale, WHITE);

        // draw the props
        for (auto prop : props)
            prop.Render(knight.getWorldPos());

        // health managment
        if (!knight.getAlive())
        {
            if (!IsSoundPlaying(defeatSound) && !played)
            {
                PlaySound(defeatSound);
                played = true;
            }
            else
                ResumeSound(defeatSound);
            
            DrawText("Game Over!", 220.f, windowHeight / 2.3f, 48, RED);
            EndDrawing();
            continue;
        }
        else if (enemies.size() == 0)
        {
            // Victory condition - all enemies defeated!
            DrawText("VICTORY!", 240.f, windowHeight / 2.3f, 48, GOLD);
            DrawText("All enemies defeated!", 180.f, windowHeight / 2.3f + 60.f, 32, LIME);
            EndDrawing();
            continue;
        }
        else
        {
            std::string knightHealth = "Health: ";
            knightHealth.append(std::to_string(knight.getHealth()), 0, 5);

            // draw health color based on value
            if (knight.getHealth() >= 75.f)
                DrawText(knightHealth.c_str(), 55.f, 45.f, 36, LIME);
            else if (knight.getHealth() >= 45.f)
                DrawText(knightHealth.c_str(), 55.f, 45.f, 36, YELLOW);
            else
                DrawText(knightHealth.c_str(), 55.f, 45.f, 36, MAROON);
                
            // Display enemy count
            std::string enemyCount = "Enemies: " + std::to_string(enemies.size());
            DrawText(enemyCount.c_str(), 55.f, 90.f, 24, WHITE);
        }

        // Update enemy spawn timer
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
            spawnRandomEnemy();
            enemySpawnTimer = 0.0f;
        }

        knight.tick(deltaTime);

        // check map bounds
        if (knight.getWorldPos().x < -130.f ||
            knight.getWorldPos().y < -100.f ||
            (knight.getWorldPos().x + windowHeight) * 0.99f > map.width * mapScale ||
            (knight.getWorldPos().y + windowHeight) * 0.99f > map.height * mapScale)
        {
            knight.undoMovement();
        }

        // check prop collisions
        for (auto prop : props)
        {
            if (CheckCollisionRecs(prop.getCollisionRec(knight.getWorldPos()), knight.getCollisionRec()))
                knight.undoMovement();

            for (auto& enemy : enemies)
                if (CheckCollisionRecs(prop.getCollisionRec(knight.getWorldPos()), enemy->getCollisionRec()))
                    enemy->undoMovement();
        }

        // Update enemies and handle collisions
        for (auto& enemy : enemies)
        {
            enemy->tick(deltaTime);

            if (CheckCollisionRecs(enemy->getCollisionRec(), knight.getCollisionRec()))
                enemy->undoMovement();
        }

        // Handle weapon attacks
        if (IsKeyPressed(KEY_SPACE))
        {
            auto it = enemies.begin();
            while (it != enemies.end())
            {
                if (CheckCollisionRecs((*it)->getCollisionRec(), knight.getWeaponCollisionRec()))
                {
                    (*it)->setAlive(false);
                    it = enemies.erase(it); // Remove dead enemies from vector
                }
                else
                {
                    ++it;
                }
            }
        }

        if (!IsSoundPlaying(gameMusic))
            PlaySound(gameMusic);

        EndDrawing();
    }
    StopSound(gameMusic);

    CloseAudioDevice();
    CloseWindow();
    
    return 0;
}
