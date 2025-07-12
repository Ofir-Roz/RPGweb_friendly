#include "DynamicScreen.h"

DynamicScreen::DynamicScreen()
{
    width = static_cast<float>(startScreenTile.width / maxFrames);
    height = static_cast<float>(startScreenTile.height / maxTileLines);
}

void DynamicScreen::Tick(float deltaTime, Vector2 mapPos)
{
    runningTime += deltaTime;
    if (runningTime >= updateTime)
    {
        frameRow++;
        if (frameRow >= maxFrames)
        {
            frameRow = 0;
            frameLine++;
            if (frameLine >= maxTileLines)
                frameLine = 0;
        }
        runningTime = 0.f;
    }

    Rectangle source{frameRow * width, frameLine * height, width, height};
    Rectangle dest{mapPos.x + 95, mapPos.y + 30, width * 1.7f, height * 1.7f};
    DrawTexturePro(startScreenTile, source, dest, Vector2{}, 0.f, WHITE);

    DrawText("Press Enter To Start", 160.f, 180.f, 33, WHITE);
}