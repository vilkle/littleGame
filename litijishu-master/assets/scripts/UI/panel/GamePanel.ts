import { BaseUI } from "../BaseUI";
import { NetWork } from "../../Http/NetWork";
import { Tools } from '../../UIComm/Tools';
import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';
import { ConstValue } from '../../Data/ConstValue';
import { GameData } from '../../Data/GameData';
import { UIManager } from '../../Manager/UIManager';
import UploadAndReturnPanel from './UploadAndReturnPanel';
import BlockData from '../../Data/BlockData';
import { BlockStructure } from '../../Data/BlockData';
import { UIHelp } from '../../Utils/UIHelp';
import { ConstWord } from '../../Data/ConstWord';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";

    @property(cc.Node)
    node_leftUpNode: cc.Node = null;

    @property(cc.Node)
    node_RightUpNode: cc.Node = null;

    @property(cc.Node)
    node_ContetNode: cc.Node = null;

    @property(cc.Node)
    node_rightDownNode: cc.Node = null;

    @property(cc.Node)
    node_LeftDownNode: cc.Node = null;

    @property(cc.Node)
    node_lightBock: cc.Node = null;

    @property(cc.Node)
    Node_TouchParent: cc.Node = null;

    @property(cc.Node)
    Node_tipBlock: cc.Node = null;

    @property(cc.Node)
    Node_tipParent: cc.Node = null;


    @property(cc.Node)
    prefab_TouchGreenNode: cc.Node = null;

    @property(cc.Prefab)
    prefab_yellowBlock: cc.Prefab = null;

    @property(cc.Label)
    lable_count: cc.Label = null;

    @property(cc.SpriteFrame)
    imge_GreenBlock: cc.SpriteFrame = null;

    private node_touchNode: cc.Node = null;

    @property(cc.Button)
    btn_tijiao: cc.Button = null;

    @property(cc.Button)
    btn_chongzi: cc.Button = null;

    private MaxX: number = 1994;
    private MinX: number = -1994;

    private MaxY: number = 960;
    private MinY: number = -960;

    private topic: Array<string> = null;
    private type: number = null;

    private v2_blockPos: Array<Array<cc.Vec2>> = null; //初始化 开始节点

    private List_treeData: Array<Array<cc.Node>> = null;

    private blockData: BlockData = null;

    private NowCanPlaceList: Array<BlockStructure> = null;

    private nowPlacePos: BlockStructure = null;

    private num_count: number = 0; //当前计数





    start() {
        this.NowCanPlaceList = new Array<BlockStructure>();
        ListenerManager.getInstance().add(ListenerType.onGreenBlockStart, this, this.onTouchGreenStart);
        ListenerManager.getInstance().add(ListenerType.onGreenBlockMove, this, this.onTouchGreenMove);
        ListenerManager.getInstance().add(ListenerType.onGreenBlockEnd, this, this.onTouchGreenEnd);

        if (ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(UploadAndReturnPanel);
        }
        this.btn_tijiao.interactable = false;
        this.btn_chongzi.interactable = false;

        //提示按钮点击事件
        for (let i = 0; i < this.node_LeftDownNode.childrenCount; i++) {
            let node_btn = this.node_LeftDownNode.children[i];
            node_btn.on(cc.Node.EventType.TOUCH_START, this.onClickTip.bind(this, i));
            node_btn.on(cc.Node.EventType.TOUCH_END, this.onClickTipEnd.bind(this, i));
            node_btn.on(cc.Node.EventType.TOUCH_CANCEL, this.onClickTipEnd.bind(this, i));


        }
        this.Node_tipBlock.active = false;

        this.List_treeData = Array<Array<cc.Node>>();
        if (ConstValue.IS_TEACHER) {
            this.topic = GameData.getInstance().topic;
            this.type = GameData.getInstance().type;
            this.init();
        } else {
            NetWork.getInstance().GetNet(function (Data) {
                //console.log("Data:", Data);
                if (Data.data != null) {
                    let courseware_content = JSON.parse(Data.data.courseware_content);
                    let topic = courseware_content.topic;
                    let type = courseware_content.type;

                    GameData.getInstance().topic = topic;
                    GameData.getInstance().type = type;

                    this.topic = topic;
                    this.type = type;
                    this.init();
                }
            }.bind(this))
        }
        ListenerManager.getInstance().trigger(ListenerType.onOnClickSaveDataBtnInteractable, false);

    }

    onDestroy() {
        ListenerManager.getInstance().removeAll(this);
    }

    //初始化
    init() {
        this.blockData = new BlockData(this.type);
        this.blockData.Show();
        this.playAnimator();
        this.initPos();
        this.initParentPos(4);
        this.ChengTypeLoadBlock(this.topic);
        this.GetNowPlacePos();
    }

    onShow() {
    }

    setPanel() {

    }

    initPos() {

        this.v2_blockPos = new Array<Array<cc.Vec2>>();

        for (let i = 0; i < 5; i++) {
            var PosX: Array<cc.Vec2> = new Array<cc.Vec2>();
            var StartPosX = -60 * i;
            var StartPosY = -35 * i;
            var x = 61;
            var y = -33;
            for (let j = 0; j < 5; j++) {
                PosX.push(cc.v2(StartPosX + (x * j), StartPosY + (y * j)));
            }

            this.v2_blockPos.push(PosX);

        }

    }

    initParentPos(type: number) {
        for (let index = 0; index < type; index++) {
            const posList = this.v2_blockPos[index];
            for (let i = 0; i < type; i++) {
                const pos = posList[i];
                let obj = this.Node_TouchParent.children[index * type + i];
                obj.setPosition(pos);
            }
        }
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_QUESTION + "?courseware_id=" + NetWork.courseware_id, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                let response_data = response;
                if (Array.isArray(response_data.data)) {
                    return;
                }
                let content = JSON.parse(response_data.data.courseware_content);
                if (content != null) {
                    this.setPanel();
                }
            } else {
                this.setPanel();
            }
        }.bind(this), null);
    }



    /* 回调方法 */
    /* 开始拖拽绿色小方块 */
    onTouchGreenStart(worldPos) {
        let obj = cc.instantiate(this.prefab_TouchGreenNode);
        obj.setParent(this.Node_TouchParent);
        let localPos = this.Node_TouchParent.convertToNodeSpaceAR(worldPos);
        obj.setPosition(localPos);
        this.node_touchNode = obj;
    }

    /* 拖拽绿色小方块 */
    onTouchGreenMove(worldPos) {
        let localPos = this.Node_TouchParent.convertToNodeSpaceAR(worldPos);
        this.node_touchNode.setPosition(localPos);

        let PosX = this.node_touchNode.x;
        let PosY = this.node_touchNode.y;

        let showPox = cc.v2(0, 0);
        if (PosX > this.MaxX) {
            showPox.x = this.MaxX;
        } else if (PosX < this.MinX) {
            showPox.x = this.MinX;
        } else {
            showPox.x = PosX;
        }

        if (PosY > this.MaxY) {
            showPox.y = this.MaxY;
        } else if (PosY < this.MinY) {
            showPox.y = this.MinY;
        } else {
            showPox.y = PosY;
        }

        this.node_touchNode.setPosition(showPox);

        //
        let resultBlockPos = this.GetNowNodeCorrespondingPos(showPox);
        this.nowPlacePos = null;
        if (resultBlockPos == false || resultBlockPos == null) {
            this.Node_tipBlock.active = false;
            return;
        } else {
            this.Node_tipBlock.active = true;
            this.Node_tipBlock.setPosition(resultBlockPos.pos);
            for (let index = 0; index < this.Node_tipBlock.childrenCount; index++) {
                const element = this.Node_tipBlock.children[index];
                element.active = true;
            }

            if (resultBlockPos.x == 0) {
                this.Node_tipBlock.children[0].active = false;
            }

            if (resultBlockPos.y == 0) {
                this.Node_tipBlock.children[1].active = false;
            }

            if (resultBlockPos.z == 0) {
                this.Node_tipBlock.children[2].active = false;
            }
        }
        this.nowPlacePos = resultBlockPos;

    }

    /* 拖拽完绿色小方块 */
    onTouchGreenEnd(worldPos) {
        try {
            //是否删除
            let nowSize = this.node_touchNode.getContentSize();
            let showPos = this.node_touchNode.getPosition();

            let localPos = this.Node_TouchParent.getPosition();
            if (!Tools.isCollisionWithRect(
                showPos, nowSize.width, nowSize.height,
                localPos, 650, 760
            )) {
                this.node_touchNode.destroy();
                this.node_touchNode = null;
            }

            this.Node_tipBlock.active = false;
            if (this.node_touchNode != null) {
                if (this.nowPlacePos == null) {
                    this.node_touchNode.destroy();
                    this.node_touchNode = null;
                } else {
                    let childIndex = 0;
                    let parent: cc.Node = null;
                    let pos: cc.Vec2 = cc.v2(0, 0);
                    childIndex = this.nowPlacePos.y * 4 + this.nowPlacePos.x;
                    console.log(" childIndex", childIndex);
                    console.log("nowPlacePos", this.nowPlacePos);
                    parent = this.Node_TouchParent.children[childIndex];
                    pos = cc.v2(0, this.nowPlacePos.z * 70);
                    this.setNodePos(parent, pos, this.nowPlacePos.z);
                    this.blockData.SetBlockList(this.nowPlacePos.y, this.nowPlacePos.x, this.nowPlacePos.z);
                    console.log(this.blockData.Show());
                    this.nowPlacePos = null;
                    this.node_touchNode = null;
                    this.GetNowPlacePos();
                    ++this.num_count;
                    this.lable_count.string = this.num_count.toString();

                    if (this.btn_tijiao.interactable) return;
                    if (this.num_count > 0) {
                        this.btn_tijiao.interactable = true;
                        this.btn_chongzi.interactable = true;
                    }


                }

            }

        } catch (e) {
            console.log(e.message);
        }
    }


    //
    playAnimator() {
        this.node_leftUpNode.setPosition(cc.v2(-1164, 322));
        this.node_leftUpNode.runAction(cc.moveTo(0.6, -827, 322));

        this.node_RightUpNode.setPosition(1465, 164);
        this.node_RightUpNode.runAction(cc.moveTo(0.6, 868, 164));

        this.node_LeftDownNode.setPosition(-1387, -343);
        this.node_LeftDownNode.runAction(cc.moveTo(0.7, -618, -343));

        this.node_rightDownNode.setPosition(1201, -352);
        this.node_rightDownNode.runAction(cc.moveTo(0.6, 799, -352));

        this.node_ContetNode.stopAllActions();
        this.node_ContetNode.setPosition(1137, -430);
        //播放放光小方块
        var seq = cc.sequence(
            cc.delayTime(2),
            cc.moveTo(0.8, -454, -430),
            cc.callFunc(function () {
                this.node_ContetNode.setPosition(1137, -430);
            }.bind(this))
        );

        this.node_ContetNode.runAction(cc.repeatForever(seq));
    }


    OnClickGetEditEndTree(CustmeEventData: number, blockCount: number) {

        // // console.log("前CustmeEventData:",CustmeEventData);
        // if(this.type ==3){
        //     let multiple =parseInt( (CustmeEventData/this.type).toString());
        //     CustmeEventData = (3+1) * multiple + CustmeEventData%this.type;
        // }

        // // console.log("后CustmeEventData:",CustmeEventData);


        if (this.List_treeData[CustmeEventData] == null) {
            let blocklist = new Array<cc.Node>();
            this.List_treeData[CustmeEventData] = blocklist;
        }

        let startPos = this.GetPos(CustmeEventData, this.type);
        let data = this.List_treeData[CustmeEventData];
        let count = data.length;

        for (let index = 0; index < count; index++) {
            const element = data[index];
            if (element != null) {
                element.active = false;
            }

        }
        let offes = 70;
        for (let index = 0; index < blockCount; index++) {
            if (index < count) {
                data[index].setPosition(0, offes * index);
                data[index].active = true;
            } else {
                let obj = cc.instantiate(this.prefab_yellowBlock);
                let nowIndex = CustmeEventData;
                if (this.type == 3) {
                    nowIndex = CustmeEventData + parseInt((CustmeEventData / this.type).toString());
                    console.log("索引：" + nowIndex);
                    console.log("当前索引：" + CustmeEventData);
                    //this.Node_TouchParent.children[CustmeEventData];
                }
                let parent: cc.Node = this.Node_TouchParent.children[nowIndex];
                obj.setParent(parent);
                obj.setPosition(0, offes * index);
                this.List_treeData[CustmeEventData].push(obj);
                obj.active = true;
            }
            let numY = parseInt((CustmeEventData / this.type) + "".toString());
            let numX = CustmeEventData % this.type;
            this.blockData.SetBlockList(numY, numX, index);//[numY][numX][index].isPlace = true;
        }

        //this.blockData.Show();


    }

    /* 获取起始坐标点 */
    GetPos(index: number, type: number) {
        let numX = index % type;
        let numY = parseInt((index / type).toString());
        return this.v2_blockPos[numY][numX];
    }

    ChengTypeLoadBlock(arrStr: Array<string>) {
        let count = arrStr.length;
        // let arrData = arrStr.slice();
        // if (this.type == 3) {
        //     arrData.splice(3, 0, "");
        //     arrData.splice(7, 0, "");
        //     arrData.splice(11, 0, "");
        // }

        for (let index = 0; index < count; index++) {

            let hength = parseInt(arrStr[index]);
            this.OnClickGetEditEndTree(index, hength);
        }
    }

    /* 获取可以可以放置的位置 */
    GetNowPlacePos() {
        this.NowCanPlaceList = null;
        this.NowCanPlaceList = new Array<BlockStructure>();
        this.GetEdgePos();

    }

    /* 获取两边的坐标位置 */
    GetEdgePos() {
        //判断最底层是否放置满了
        //检查  一层一层检查
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    try {
                        if (!this.blockData.BlockList[y][x][z].isPlace) {
                            if (x == 0 && y != 0) { //检查最底层的两边

                                if (this.blockData.BlockList[y - 1][x][z].isPlace && z == 0) { //检查y最下层的节点
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                    break;
                                } else if (this.blockData.BlockList[y][x][z - 1].isPlace &&
                                    this.blockData.BlockList[y - 1][x][z].isPlace
                                ) { //检查x中层的节点
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                    break;
                                }
                            } else if (y == 0 && x != 0) {
                                if (this.blockData.BlockList[y][x - 1][z].isPlace && z == 0) {//检查x最下层的节点
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                    break;
                                }
                                else if (this.blockData.BlockList[y][x][z - 1].isPlace &&
                                    this.blockData.BlockList[y][x - 1][z - 1].isPlace
                                ) { //检查y中层层的节点
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                    break;
                                }
                            } else if (z != 0 && x == 0 && y == 0) {  //检查的是中间的位置 前面没有的中间有的后面就不检查了 131 21 1
                                if (this.blockData.BlockList[y][x][z - 1].isPlace) {
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                    break;
                                }
                            }
                            else {

                                if (z == 0) { //中间最下层的节点
                                    if (x != 0 && y != 0) {
                                        if (this.blockData.BlockList[y][x - 1][z].isPlace &&//左面必须有
                                            this.blockData.BlockList[y - 1][x][z].isPlace //后面必须有
                                        ) {
                                            this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                        }
                                    }
                                    // this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);

                                }
                                else if
                                    (this.blockData.BlockList[y][x][z - 1].isPlace && //下面必须有
                                    this.blockData.BlockList[y][x - 1][z].isPlace &&//左面必须有
                                    this.blockData.BlockList[y - 1][x][z].isPlace //后面必须有
                                ) {
                                    this.NowCanPlaceList.push(this.blockData.BlockList[y][x][z]);
                                }

                            }

                        }


                    } catch (e) {
                        console.error(e.message);
                        console.log("z,y,x:" + z, y, x);
                    }

                }

            }

        }
        console.log("NowCanPlaceList:", this.NowCanPlaceList);


    }


    /* 获取当前点对应的位置 */


    /* 获取当前节点对应最底层的位置 */
    GetNowNodeCorrespondingPos(pos: cc.Vec2) {
        //console.log("开始");
        let minDis: number = 0;
        let minxBlockStructure = null;
        for (let index = 0; index < this.NowCanPlaceList.length; index++) {
            try {
                const element = this.NowCanPlaceList[index].pos;
                let dis = Math.sqrt((pos.x - element.x) * (pos.x - element.x) + (pos.y - element.y) * (pos.y - element.y));
                if (minDis == 0) {
                    minDis = dis;
                    minxBlockStructure = this.NowCanPlaceList[index];
                } else if (minDis > dis) {
                    minDis = dis;
                    minxBlockStructure = this.NowCanPlaceList[index];
                }
                // console.log(dis);
            } catch (e) {
                console.error(e.message);
            }
        }
        //console.log("minxBlockStructure:",minxBlockStructure);
        // console.log("minDis：" + minDis);
        // console.log("结束");

        if (minDis > 200) {
            return false;
        } else {
            return minxBlockStructure;
        }

    }

    setNodePos(parent: cc.Node, pos: cc.Vec2, height: number) {
        if (parent.childrenCount > height) {
            parent.children[height].active = true;
            parent.children[height].getComponent(cc.Sprite).spriteFrame = this.imge_GreenBlock;
            this.node_touchNode.setPosition(pos);
            this.node_touchNode.destroy();
        } else {
            this.node_touchNode.setParent(parent);
            this.node_touchNode.getComponent(cc.Sprite).spriteFrame = this.imge_GreenBlock;
            this.node_touchNode.setPosition(pos);
        }
    }

    /* 提交 */
    onClickTijiao() {
        let TypeSplicingIndex = 0;
        let nowCubeCount: number = 0
        nowCubeCount = this.Node_TouchParent.children[0].childrenCount;

        let NowMaxCubeCount = 0;
        for (let i = 0; i < 16; i++) {
            let NowNode = this.Node_TouchParent.children[i];
            if (NowMaxCubeCount < NowNode.childrenCount) {
                NowMaxCubeCount = NowNode.childrenCount;
            }
        }

        if(NowMaxCubeCount !=3 && NowMaxCubeCount !=4){
            this.loser();
            return;
        }

        for (let i = 0; i < 16; i++) {

            if(this.Node_TouchParent.children[i].childrenCount == 0){
                continue;
            }
            if (NowMaxCubeCount != this.Node_TouchParent.children[i].childrenCount) {
                this.loser();
                return;
            } 
        }

        if(NowMaxCubeCount  != this.type){
            this.loser(ConstWord._005);
            return;
        }

        let nowIndex: number = 0;
        let isCube = true; //检查是否为当前类型正方体
        //检查是否为正方体
        if (this.type == 3) {
            for (let i = 0; i < 9; i++) {
                nowIndex = i + parseInt((i / this.type).toString());
                let NowNode = this.Node_TouchParent.children[nowIndex];
                if (NowNode.childrenCount != this.type) {
                    this.loser();
                    return;
                }
            }
        } else {
            console.log(this.Node_TouchParent.childrenCount);
            for (let index = 0; index < 16; index++) {
                let NowNode = this.Node_TouchParent.children[index];

                if (NowNode.childrenCount != this.type) {
                    this.loser();
                    return;
                }
                console.log(NowNode.childrenCount);
            }
        }


        //判断是否为当前类型相同的正方体
        let isCubeTypeEqual = true;
        let count = this.type;
        for (let i = 0; i < this.Node_TouchParent.childrenCount; i++) {
            let NowNode = this.Node_TouchParent.children[nowIndex];
            if (NowNode.childrenCount == 0) {
                continue;

            }
            if (count != NowNode.childrenCount) {
                isCubeTypeEqual = false;
                return;
            }
        }
        if (!isCubeTypeEqual) {
            this.loser(ConstWord._005);
            return;
        }

        this.succeed();
    }

    /* 失败 */
    loser(str: string = "") {
        if (str == "") {
            UIHelp.showTip(ConstWord._006);

        } else {
            UIHelp.showTip(str);
        }
    }

    /* 成功 */
    succeed() {
        UIHelp.showOverTip(1, ConstWord._004, function () {
            this.reset();

        }.bind(this));
        ListenerManager.getInstance().trigger(ListenerType.onOnClickSaveDataBtnInteractable, true);

    }


    /* 重置 */
    onClickReset() {
        UIHelp.AffirmTip(1, ConstWord._003, () => { this.reset() })
    }

    reset() {
        //初始化
        this.lable_count.string = "";
        this.num_count = 0;
        for (let j = 0; j < this.Node_TouchParent.childrenCount; j++) {
            const element = this.Node_TouchParent.children[j];
            for (let x = 0; x < element.childrenCount; x++) {
                element.children[x].active = false;
            }
        }

        this.blockData = null;
        this.blockData = new BlockData(this.type);
        this.ChengTypeLoadBlock(this.topic);
        this.GetNowPlacePos();
        this.btn_tijiao.interactable = false;
        this.btn_chongzi.interactable = false;

        for (let j = 0; j < this.Node_TouchParent.childrenCount; j++) {
            const element = this.Node_TouchParent.children[j];
            for (let x = 0; x < element.childrenCount; x++) {
                if (element.children[x].name == "greenBlock") {
                    element.children[x].destroy();
                }
            }
        }
    }

    /* 提示 */
    onClickTip(CustomEventData: number, Event: any) {

        for (let i = 0; i < this.Node_tipParent.childrenCount; i++) {
            const element = this.Node_tipParent.children[i];
            element.active = false;
        }

        try {
            const element = this.Node_tipParent.children[CustomEventData];
            element.active = true;
        } catch (e) {
            console.error(e.message);
        }
    }

    /* 提示 */
    onClickTipEnd(CustomEventData: number, Event: any) {

        try {
            const element = this.Node_tipParent.children[CustomEventData];
            this.scheduleOnce(() => { element.active = false }, 2);
        } catch (e) {
            console.error(e.message);
        }

    }











}
