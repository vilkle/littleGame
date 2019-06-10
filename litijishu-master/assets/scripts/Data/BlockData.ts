

const {ccclass, property} = cc._decorator;
/* 小方块的数据结构 */
export class BlockStructure{
    public isPlace:boolean = false; //是否放置
    public x:number = 0;
    public y:number = 0;
    public z:number = 0;
    public pos:cc.Vec2 = cc.v2(0,0);
    
}

@ccclass
export default class BlockData {
    
    public BlockList:Array<Array<Array<BlockStructure>>> = null;

    constructor(type:number) {
        this.BlockList = new Array<Array<Array<BlockStructure>>>();

    //    for (let y = 0; y < 4; y++) {
    //     var PosX: Array<Array<BlockStructure>> = new  Array<Array<BlockStructure>>();
    //         var StartPosYX = -60 * y;
    //         var StartPosYY = -35 * y;

    //         // var StartPosX = -60 * y;
    //         // var StartPosY = -35 * y;
    //         // var xx = 61;
    //         // var xy = -33;

    //       for (let x = 0; x < 4; x++) {
    //           var PosZ: Array<BlockStructure> = new  Array<BlockStructure>();
    //           var StartPosXX = StartPosYX + (61 * x);
    //           var StartPosXY = StartPosYY +(-33 * y);
              
    //           for (let z = 0; z <4; z++) {

    //             var StartPosZY = StartPosXY + (70 * z);
    //             let block = new BlockStructure();
    //             block.isPlace = false;
    //             block.y = y;
    //             block.x = x;
    //             block.z = z;
    //             block.pos  = cc.v2(StartPosXX,StartPosZY); 
    //             PosZ.push(block);
    //           }
    //           PosX.push(PosZ);
    //       }
    //       this.BlockList.push(PosX);
    //    }

    for (let i = 0; i < 4; i++) {
        var PosX: Array<Array<BlockStructure>> = new  Array<Array<BlockStructure>>();
        var StartPosX = -60 * i;
        var StartPosY = -35 * i;
        var x = 61;
        var y = -33;
        for (let j = 0; j < 4; j++) {
            var PosZ: Array<BlockStructure> = new  Array<BlockStructure>();
            for (let z = 0; z <4; z++) {
                let block = new BlockStructure();
                block.isPlace = false;
                block.y = i;
                block.x = j;
                block.z = z;
                block.pos = cc.v2(StartPosX + (x * j), StartPosY + (y * j) + z*70)
                PosZ.push(block);
            }
            PosX.push(PosZ);
            
        }
        this.BlockList.push(PosX);

    }
       //console.log("初始化完成");
    }
    Show(){
        console.log(this.BlockList);
    }

    /**
     * 
     * @param y 
     * @param x 
     * @param z 
     */
    SetBlockList(y:number,x:number,z:number){
        this.BlockList[y][x][z].isPlace = true;
    }

   
}
