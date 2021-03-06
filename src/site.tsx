import * as React from "react";
import App from "./app";

export default () => (

    <div>
        <h1>Roguelike Map Generation and Field of Vision</h1>
        <p>What you see below is the result of experiments I have played with to mimic modern dungeon crawlers; like Diablo and Path of Exile, but also have the nostalgic feel from traditional Roguelike games; like Rogue, NetHack and Angband.</p>

        <p>This was primarily developed in a 2D creation library known as <a href="http://www.pixijs.com">PIXI.js</a>, and Uses <a href="http://aurelia.io/">Aurelia</a> and <a href="https://webpack.js.org/">Webpack</a> to componentise and build the game.</p>

        <h3>Map Generation</h3>

        <p>The algorithm used to generate the map below uses a variety of techniques that I have borrowed, invented and combined together to create maps that have rooms, open space and narrow corridors.</p>

        <App animate={true} showPlayer={false} />

        <p>The generation itself happens inside a Web Worker. This helps manage concurrency and prevents the map generation from blocking the UI. If you're running on a slow machine, this might make the animation jittery and inconsistant.</p>

        <ol>
            <li>The first step is to randomly place rooms with varying position, height, and width.</li>
            <li>Next, I use a popular maze generation algorithm known as <a href="http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking">Recursive Backtracking</a> to populate the rest of the map with mazes.</li>
            <li>To connect the maze up to the rooms, I place doors to open up each room, interconnecting all possible routes in the map.</li>
            <li>Now that the rooms are connected, I remove all dead ends to allow for singular paths between each room. This is done by traversing all cells on the map, and removing those that have a single opening.</li>
            <li>Now that we have singular routes between each room. We're now left with leftover maze that makes traversing the map tedious. To resolve this, I developed an algorithm that reduces the slack of each remaining route to make them more direct.</li>
            <li>Lastly, I remove all unnecessary walls and artifacts, resulting in what you see above.</li>
        </ol>

        <h3>Field of Vision</h3>

        <p>I adapted an algorithm used for popular Roguelike games called <a href="http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting">Recursive Shadowcasting</a> to cast a Field of Vision around the player, this is similar to a torch affect you see in modern 2D video games. I then use the distance the tile is from the player to determine the opacity, or lighting, that visible tiles should have at that given point in time.</p>
        <p>I also implemented a very simple Fog of War mechanic that leaves viewed tiles a dark shade of gray once they have been visited.</p>
        <p>You can control the red square below by using the WSAD keys.</p>

        <App animate={false} showPlayer={true} showFOV={true} tileSize={50} seed="3254" />

        <p>I do intend to extend this to make it a fully functioning Rogue-Like game in the future. In the meantime, feel free to play around with the Maze Generation and Field of View demos above. You can find the repository <a href="https://github.com/jmussett/Rogue">Here</a></p>
    </div>

);
