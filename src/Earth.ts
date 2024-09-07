/* Assignment 3: Earthquake Visualization Support Code
 * UMN CSci-4611 Instructors 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * Please do not distribute beyond the CSci-4611 course
 */

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Node3 {
    private earthMesh: gfx.MorphMesh3;

    public globeMode: boolean;

    public earthquakes: EarthquakeMarker[] = [];

    public rotate: number;

    constructor() {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh3();

        this.globeMode = false;

        this.rotate = 0;
    }

    public createMesh(): void {
        // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');

        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);

        // You can use this variable to define the resolution of your flat map and globe map
        // using a nested loop. 20x20 is reasonable for a good looking sphere, and you don't
        // need to change this constant to complete the base assignment.
        const meshResolution = 20;

        // Precalculated vertices and normals for the earth plane mesh.
        // After we compute them, we can store them directly in the earthMesh,
        // so they don't need to be member variables.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];

        const sphereVertices: gfx.Vector3[] = [];
        const sphereNormals: gfx.Vector3[] = [];

        // Part 1: Creating the Flat Map Mesh
        // To demo, we'll add a rectangle with two triangles.
        // This defines four vertices at each corner in latitude and longitude 
        // and converts to the coordinates used for the flat map.
        for (let i = 0; i <= meshResolution; i++) {
            for (let j = 0; j <= meshResolution; j++) {
                const x = (j / meshResolution) * 180 - 180 / 2;
                const y = (i / meshResolution) * 360 - 180;
                mapVertices.push(this.convertLatLongToPlane(x, y));
                mapNormals.push(gfx.Vector3.BACK);
            }
        }


        // Define indices into the array for the two triangles
        // const indices: number[] = [];
        // indices.push(0, 1, 2);
        // indices.push(0, 2, 3);

        const indices: number[] = [];
        for (let i = 0; i < meshResolution; i++) {
            for (let j = 0; j < meshResolution; j++) {
                const p1 = i * (meshResolution + 1) + j;
                const p2 = p1 + 1;
                const p3 = (i + 1) * (meshResolution + 1) + j;
                const p4 = p3 + 1;

                // Define the two triangles for each quad
                indices.push(p1, p3, p2);
                indices.push(p2, p3, p4);
            }
        }


        // Part 2: Texturing the Mesh
        // You should replace the example code below with texture coordinates for the earth mesh.
        // const texCoords: number[] = [];
        // texCoords.push(0, 0);
        // texCoords.push(0, 0);
        // texCoords.push(0, 0);
        // texCoords.push(0, 0);

        const texCoords: number[] = [];
        for (let i = 0; i <= meshResolution; i++) {
            for (let j = 0; j <= meshResolution; j++) {
                const u = i / meshResolution;
                const v = 1 - (j / meshResolution);
                texCoords.push(u, v);
            }
        }


        // Set all the earth mesh data
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);

        // Part 3: Creating the Globe Mesh
        // You should compute a new set of vertices and normals
        // for the globe. You will need to also add code in
        // the convertLatLongToSphere() method below.
        for (let i = 0; i <= meshResolution; i++) {
            for (let j = 0; j <= meshResolution; j++) {
                const x = (j / meshResolution) * 180 - 180 / 2;
                const y = (i / meshResolution) * 360 - 180;
                sphereVertices.push(this.convertLatLongToSphere(x, y));
                const norm = sphereVertices[sphereVertices.length - 1].clone()
                norm.normalize();
                sphereNormals.push(norm);
            }
        }
        this.earthMesh.setMorphTargetVertices(sphereVertices);
        this.earthMesh.setMorphTargetNormals(sphereNormals);

        // Add the mesh to this group
        this.add(this.earthMesh);
    }

    public update(deltaTime: number): void {
        // Part 4: Morphing Between the Map and Globe
        // The value of this.globeMode will be changed whenever
        // the user selects flat map or globe mode in the GUI.
        // You should use this boolean to control the morphing
        // of the earth mesh, as described in the readme.
        if (this.globeMode) {
            if (this.earthMesh.morphAlpha < 1) {
                this.earthMesh.morphAlpha += deltaTime;
            }
            this.rotate += deltaTime;
            // this.earthMesh.rotation.setEulerAngles((-Math.PI), Math.PI + this.rotate, Math.PI);
            this.earthMesh.morphAlpha = Math.min(this.earthMesh.morphAlpha, 1);
        } else {
            if (this.earthMesh.morphAlpha > 0) {
                this.earthMesh.morphAlpha -= deltaTime;
            }
            this.earthMesh.morphAlpha = Math.max(this.earthMesh.morphAlpha, 0);
        }

    }

    public createEarthquake(record: EarthquakeRecord) {
        // Number of milliseconds in 1 year (approx.)
        var duration = 12 * 28 * 24 * 60 * 60;

        // Part 5: Creating the Earthquake Markers
        // Currently, the earthquakes are just placed randomly
        // on the plane. You will need to update this code to
        // correctly calculate both the map and globe positions of the markers.

        // const mapPosition = new gfx.Vector3(Math.random() * 6 - 3, Math.random() * 4 - 2, 0);
        // const globePosition = new gfx.Vector3(Math.random() * 6 - 3, Math.random() * 4 - 2, 0);

        const mapPosition = this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePosition = this.convertLatLongToSphere(record.latitude, record.longitude);

        const markerSize = record.magnitude / 20;
        const color = new gfx.Color(1, 0, 0);

        const earthquake = new EarthquakeMarker(mapPosition, globePosition, record, duration);

        // Global adjustment to reduce the size. You should probably
        // update this be a more meaningful representation.
        earthquake.scale.set(markerSize, markerSize, markerSize);
        earthquake.material.setColor(color);

        // Uncomment this line of code to active the earthquake markers
        this.add(earthquake);


    }

    public animateEarthquakes(currentTime: number) {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Node3) => {
            if (quake instanceof EarthquakeMarker) {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                // The earthquake has exceeded its lifespan and should be moved from the scene
                if (playbackLife >= 1) {
                    quake.remove();
                }
                // The earthquake positions should be updated
                else {
                    // Part 6: Morphing the Earthquake Positions
                    // If you have correctly computed the flat map and globe positions
                    // for each earthquake marker in part 5, then you can simply lerp
                    // between them using the same alpha as the earth mesh.
                    const mapPosition = (quake as EarthquakeMarker).mapPosition;
                    const globePosition = (quake as EarthquakeMarker).globePosition;
                    const interpolatedPosition = gfx.Vector3.lerp(mapPosition, globePosition, this.earthMesh.morphAlpha);

                    quake.position.copy(interpolatedPosition);

                    const minSize = 0;
                    const maxSize = 0.7;
                    if (quake.magnitude > 0)
                        quake.magnitude -= 0.01 * quake.magnitude;
                    const size = gfx.MathUtils.lerp(minSize, maxSize, quake.magnitude);

                    const yellow = new gfx.Color(1, 1, 0);
                    const red = new gfx.Color(1, 0, 0);
                    const color = gfx.Color.lerp(yellow, red, quake.magnitude);
                    quake.duration -= 0.005 * quake.duration;

                    quake.scale.set(size, size, size);
                    quake.material.setColor(color);
                }
            }
        });
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the flat map coordinate system described in the readme.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3 {
        return new gfx.Vector3(longitude * Math.PI / 180, latitude * Math.PI / 180, 0);
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the globe mesh map coordinate system described in the readme.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3 {
        // Part 3: Creating the Globe Mesh
        // Add code here to correctly compute the 3D sphere position
        // based on latitude and longitude.
        const latRad = latitude * Math.PI / 180;
        const longRad = longitude * Math.PI / 180;

        const x = Math.cos(latRad) * Math.sin(longRad);
        const y = Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(longRad);

        return new gfx.Vector3(x, y, z);
    }

    // This function toggles the wireframe debug mode on and off
    public toggleDebugMode(debugMode: boolean) {
        this.earthMesh.material.wireframe = debugMode;
    }
}