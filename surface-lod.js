import * as THREE from 'three';

/** Camera-relative nested spherical terrain patches. Uses the same global sample callback at every scale. */
export function createSurfaceLOD({planet,camera,controls,sample,getSeed}) {
  const root=new THREE.Group();planet.add(root);
  const levels=[
    {width:.38,segments:44,threshold:.60},
    {width:.115,segments:52,threshold:.21},
    {width:.032,segments:64,threshold:.065},
    {width:.008,segments:72,threshold:.018}
  ];
  const palette={OCEAN:0x194f75,ICE:0xeaf2f5,ALPINE:0x858580,TUNDRA:0x8b9c83,DESERT:0xd7b980,GRASSLAND:0x83a45d,RAINFOREST:0x1d6841,FOREST:0x376e46};
  let focus=null,patches=[],vegetation=null,active=0,shown=false;
  const vec=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3();
  function basis(normal){vec.copy(normal).normalize();right.set(0,1,0);if(Math.abs(vec.dot(right))>.97)right.set(1,0,0);right.cross(vec).normalize();up.crossVectors(vec,right).normalize();}
  function fract(x){return x-Math.floor(x)}
  function hash(x,y,z,seed){return fract(Math.sin(x*127.1+y*311.7+z*74.7+seed*.001)*43758.5453)}
  function micro(n,frequency,seed){const x=n.x*frequency,y=n.y*frequency,z=n.z*frequency;const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),a=x-ix,b=y-iy,c=z-iz;const smooth=t=>t*t*(3-2*t);const sx=smooth(a),sy=smooth(b),sz=smooth(c);const h=(dx,dy,dz)=>hash(ix+dx,iy+dy,iz+dz,seed);const lerp=(v,w,t)=>v+(w-v)*t;return lerp(lerp(lerp(h(0,0,0),h(1,0,0),sx),lerp(h(0,1,0),h(1,1,0),sx),sy),lerp(lerp(h(0,0,1),h(1,0,1),sx),lerp(h(0,1,1),h(1,1,1),sx),sy),sz)*2-1}
  function position(normal,level,offset=0){const s=sample(normal.x,normal.z,normal.y);const relief=Math.max(0,s.elevation)/9000*.075+Math.min(0,s.elevation)/11000*.012;
    const detail=s.elevation>0?micro(normal,95,getSeed())*.0007+micro(normal,390,getSeed()+11)*.00022+micro(normal,1650,getSeed()+23)*.000055:0;
    return {point:normal.clone().multiplyScalar(1+relief+detail+offset),s};
  }
  function clear(){for(const p of patches){root.remove(p);p.geometry.dispose();p.material.dispose()}patches=[];if(vegetation){root.remove(vegetation);vegetation.geometry.dispose();vegetation.material.dispose();vegetation=null}active=0}
  function buildLevel(index){const level=levels[index],N=level.segments,w=level.width;basis(focus);
    const verts=[],colors=[],indices=[];const seed=getSeed();const col=new THREE.Color();
    for(let y=0;y<=N;y++)for(let x=0;x<=N;x++){
      const u=(x/N-.5)*w,v=(y/N-.5)*w;
      const normal=vec.clone().addScaledVector(right,u).addScaledVector(up,v).normalize();
      const edge=Math.max(Math.abs(u),Math.abs(v))/(w*.5);
      const {point,s}=position(normal,index,.00045+index*.00017);
      verts.push(point.x,point.y,point.z);
      col.setHex(palette[s.biome]);const grain=micro(normal,180,seed)*.11+micro(normal,700,seed+3)*.045;
      if(s.elevation>0)col.multiplyScalar(.91+grain);
      if(s.elevation>2200&&s.biome!=='ICE')col.lerp(new THREE.Color(0x9c9b93),Math.min(.52,(s.elevation-2200)/6000));
      // Blend outermost border toward underlying base to avoid a sharp color seam.
      if(edge>.86)col.multiplyScalar(1-(edge-.86)*.2);
      colors.push(col.r,col.g,col.b);
      if(x<N&&y<N){const a=y*(N+1)+x,b=a+1,c=a+N+1,d=c+1;indices.push(a,c,b,b,c,d)}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
    const tile=new THREE.Mesh(g,material);tile.frustumCulled=false;tile.visible=false;root.add(tile);patches.push(tile);
  }
  function buildVegetation(){basis(focus);const positions=[],colors=[];const seed=getSeed();
    for(let i=0;i<1900;i++){const u=(hash(i,5,7,seed)-.5)*.024,v=(hash(i,11,13,seed)-.5)*.024;
      const n=vec.clone().addScaledVector(right,u).addScaledVector(up,v).normalize();
      const {point,s}=position(n,3,.00055);
      if(!['FOREST','RAINFOREST','GRASSLAND'].includes(s.biome)||s.elevation<2||hash(i,19,23,seed)>.73)continue;
      positions.push(point.x,point.y,point.z);
      const c=new THREE.Color(s.biome==='GRASSLAND'?0x9eb16d:0x225e37).multiplyScalar(.7+hash(i,2,3,seed)*.6);
      colors.push(c.r,c.g,c.b);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    vegetation=new THREE.Points(g,new THREE.PointsMaterial({size:.0045,sizeAttenuation:true,vertexColors:true,depthWrite:true}));vegetation.visible=false;root.add(vegetation);
  }
  function focusAt(worldPoint){const local=planet.worldToLocal(worldPoint.clone()).normalize();focus=local;clear();for(let i=0;i<levels.length;i++)buildLevel(i);buildVegetation();shown=true;
    const surface=planet.localToWorld(position(local,0,.004).point);
    const outward=surface.clone().sub(planet.getWorldPosition(new THREE.Vector3())).normalize();
    controls.target.copy(surface);camera.position.copy(surface).addScaledVector(outward,.27);controls.minDistance=.0018;controls.maxDistance=2.5;controls.maxPolarAngle=Math.PI;controls.update();
    return surface;
  }
  function update(){if(!shown)return 0;const distance=camera.position.distanceTo(controls.target);let count=0;
    for(let i=0;i<levels.length;i++){const visible=distance<levels[i].threshold;patches[i].visible=visible;if(visible)count++}
    if(vegetation)vegetation.visible=distance<.038;active=count;return count;
  }
  function exit(){shown=false;focus=null;clear();controls.target.set(0,0,0);camera.position.set(0,1.8,4.2);controls.minDistance=1.13;controls.maxDistance=18;controls.maxPolarAngle=Math.PI;controls.update()}
  return {focusAt,update,exit,get active(){return active},get focused(){return shown}};
}
