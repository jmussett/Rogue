import { Character } from "../character";
import { random } from "../Utility/util";
import IRoom from "../Utility/IRoom";

interface IEnemyContainerOptions {
    tileSize: number;
}

export default class EnemyContainer extends PIXI.Container {
    private enemies: Character[];
    private tileSize: number;
    constructor(options: IEnemyContainerOptions) {
        super();
        this.tileSize = options.tileSize;
    }
    Render(rooms: IRoom[], wallWidth: number, mazeWidth: number) {
        const enemyGraphics = new PIXI.Graphics();
        enemyGraphics.beginFill(0xFF0000);
        enemyGraphics.lineStyle(1, 0xFFFFFF);
        enemyGraphics.drawRect(0, 0, 40, 40);
        enemyGraphics.endFill();

        const enemyTexture = enemyGraphics.generateCanvasTexture();

        for (const room of rooms) {
            for (let i = 0; i < 10; i++) {
                const enemy = new Character({texture: enemyTexture});

                const roomXPosition = room.x * (wallWidth + mazeWidth) + wallWidth;
                const roomYPosition = room.y * (wallWidth + mazeWidth) + wallWidth;

                const roomXBorderPosition = room.xBorder * (wallWidth + mazeWidth) - wallWidth;
                const roomYBorderPosition = room.yBorder * (wallWidth + mazeWidth) - wallWidth;

                enemy.position.x = random(roomXPosition * this.tileSize, roomXBorderPosition * this.tileSize);
                enemy.position.y = random(roomYPosition * this.tileSize, roomYBorderPosition * this.tileSize);

                this.addChild(enemy);
            }
        }
    }
}
