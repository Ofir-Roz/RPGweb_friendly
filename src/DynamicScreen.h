#include "raylib.h"

class DynamicScreen
{
private:
    Texture2D startScreenTile = LoadTexture("nature_tileset/dune_globe.png");
    float runningTime{};
    int frameRow{};
    int frameLine{};
    int maxFrames{40};
    int maxTileLines{4};
    float updateTime{1.f / 18.f};
    float width{};
    float height{};
public:
    DynamicScreen();
    void Tick(float deltaTime, Vector2 mapPos);
};
