import { BaseUI } from "../BaseUI";
import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';
import { UIManager } from '../../Manager/UIManager';
import TiJiaoAndFanHuiPanel from './TiJiaoAndFanHuiPanel';
import { ConstValue } from '../../Data/ConstValue';
import { GameData } from '../../Data/GameData';
import { NetWork } from '../../Http/NetWork';
import TreeData from '../../Data/TreeData';
import { Tools } from '../../UIComm/Tools';
import { LineTreenData } from '../../Data/TreeData';
import { UIHelp } from '../../Utils/UIHelp';
import { ConsWorld } from '../../Data/ConstWorld';
import { AudioManager } from '../../Manager/AudioManager';
import DataReporting from '../../Data/DataReporting';
import { toString } from '../../collections/arrays';
const { ccclass, property } = cc._decorator;

class DataReport {
    public subject: string = ""; //题目
    public answer: string = ""; //作答信息
    public result: number = 0; //结果
 }

 class EventValue{
    public isResult:number=1; //是否有正确答案
    public isLavel:number=1; //是否有关卡
    public levelData:Array<DataReport> =null;
    public result:number=1;// 1.正确 2 错误 3重复 4 未作答 5已作答
 }

@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";

    @property(cc.Node)
    private node_KeyBoard: cc.Node = null; //小键盘

    @property(cc.Node)
    node_editNode: cc.Node = null; // 编辑的节点

    @property(cc.Node)
    node_footItem: cc.Node = null; //

    @property(cc.Node)
    node_footParent: cc.Node = null; //

    @property(cc.Node)
    node_show: cc.Node = null; //显示拖动父物体

    @property(cc.Node)
    node_ShowItem: cc.Node = null; //显示的item

    @property(cc.Node)
    node_Mask: cc.Node = null; //显示的item

    @property(cc.Node)
    node_topicDes: cc.Node = null; //题目描述
    @property(cc.Button)
    btn_xila: cc.Button = null; //提交按钮


    @property(cc.Button)
    btn_tijiao: cc.Button = null; //提交按钮

    @property(cc.Label)
    tipic_des:cc.Label = null; //题目描述

    @property(cc.Node)
    node_cursor:cc.Node = null; //光标
    




    @property(cc.SpriteFrame)
    imput_selected: cc.SpriteFrame = null; //

    @property(cc.SpriteFrame)
    imput_normal: cc.SpriteFrame = null; // 

    @property(cc.Label)
    lable_input: cc.Label = null; //输入文本框
    
    
    @property(cc.Node)
    node_hand: cc.Node = null;

    private isShow: boolean = false;
    private onClickKeyBoardIsOnClick: boolean = true; //
    public gameAnswer: Array<string> = null;
    public topic: Array<string> = null;
    public topicDes: string = "";

    private nowCreatorTouchItem: cc.Node = null;

    //是否可以吸附
    private isCanAdsorb: boolean = false; // 是否可以吸附

    private adsorbNode: cc.Node = null; //可吸附的节点

    private nowItemIndex: number = 0; //当前的索引
    private touchStartPos: cc.Vec2 = cc.v2(0, 0); //拖动开始的坐标
    private treeData: TreeData = null;
    private root: cc.Node = null;
    private inContentTouchParent: cc.Node = null; // 显示在树形图中 拖动时候的父物体

    private topicDesShowState:boolean = true;

    private TijiaoNumber:number = 0;

    private DelTreeData:LineTreenData = null;

    private dataReport:DataReport = null;

    private eventValue:EventValue = null; 

    private num_answerState:number = 0;

    start() {
        this.dataReport = new DataReport();

        this.eventValue = new EventValue();
        this.eventValue.isResult =1;
        this.eventValue.isLavel = 0;
        DataReporting.getInstance().addEvent('end_game', this.onEndGame.bind(this));

        DataReporting.getInstance().addEvent('end_game', this.onEndGame.bind(this));
        AudioManager.getInstance().playBGM("bgm_underwater");
        ListenerManager.getInstance().add(ListenerType.OnClickKeyBoard, this, this.OnClickInput.bind(this));
        ListenerManager.getInstance().add(ListenerType.SendDatatijiaoOnClick, this, this.OnClickSubmitData.bind(this));
        ListenerManager.getInstance().add(ListenerType.delStudent,this,this.onDes)
        this.DelTreeData = new LineTreenData();
        this.DelTreeData.childList = new Array<LineTreenData>();
        this.DelTreeData.parentIndexData = Array<number>();
        this.DelTreeData.lineAllParentType = Array<number>();
        this.treeData = new TreeData();
        this.eventshowState(true);
        if (ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(TiJiaoAndFanHuiPanel);
        }

        if (ConstValue.IS_TEACHER) {
            this.topic = GameData.getInstance().topic;
            this.gameAnswer = GameData.getInstance().gameAnswer;
            this.topicDes = GameData.getInstance().topicDes;
            this.init();
        } else {
            NetWork.getInstance().GetNet(function (Data) {
                //console.log("Data:", Data);
                if (Data.data != null) {
                    let courseware_content = JSON.parse(Data.data.courseware_content);
                    let topicData = courseware_content.topic;
                    let AnswerData = courseware_content.gameAnswer;
                    let TopicDes = courseware_content.topicDes;
                    GameData.getInstance().topic = topicData;
                    GameData.getInstance().gameAnswer = AnswerData;
                    GameData.getInstance().topicDes = TopicDes;
                    this.topicDes = TopicDes;
                    this.topic = topicData;
                    this.gameAnswer = AnswerData;
                    this.init();
                }
            }.bind(this))
        }

    }

    init() {
        this.dataReport.subject = JSON.stringify( this.topic);
        this.initFootNode(this.topic);
        this.node_Mask.active = false;
        this.tipic_des.string = this.topicDes;

    }

    initFootNode(topic: Array<string>) {
        let count = topic.length;
        for (let index = 0; index < count; index++) {
            const element = topic[index];
            let obj = cc.instantiate(this.node_footItem);
            let skeleton = obj.children[0].getComponent(sp.Skeleton);
            let str = '0' + (index + 1);
            console.log(str);
            skeleton.defaultSkin = str;
            obj.setParent(this.node_footParent);
            obj.getComponent("FootItem").studentInit(index, topic[index]);
           

        }
    }

    onDestroy() {

    }

    onShow() {
    }

    touchHave(obj: cc.Node, WordPos: cc.Vec2, lineData: LineTreenData, parent: cc.Node) {
        let thisNodeParent = obj.getParent().getParent();
        this.inContentTouchParent = parent;
        this.inContentTouchParent.getComponent(cc.Layout).updateLayout();
        this.nowCreatorTouchItem = obj;
        this.nowCreatorTouchItem.setParent(this.node);
        let localPos = this.node.convertToNodeSpaceAR(WordPos);
        this.nowCreatorTouchItem.setPosition(localPos);

        if (thisNodeParent.getComponent("showItem") != null) {
            thisNodeParent.getComponent("showItem").updateSprite();
            //console.log("更新了");
        }

        this.treeData.Del(lineData, lineData.parentIndexData, lineData.index);
        AudioManager.getInstance().playSound("sfx_pressfish",false,1);
        this.DelTreeData = lineData;
        //console.log(this.detectionList);
        this.touchStartPos = localPos;
        //this.node_Mask.active = true;

    }

    //拖拽开始
    TouchStart(WordPos: cc.Vec2, type: number, des: string) {
        console.log("game type:" + type);
        console.log("des:" + des);
        console.log("start");
        this.nowCreatorTouchItem = cc.instantiate(this.node_ShowItem);
        AudioManager.getInstance().playSound("sfx_pressfish",false,1);
        let skeleton = this.nowCreatorTouchItem.children[0].children[0].children[0].getComponent(sp.Skeleton);
            let str = '0' + (type + 1);
            skeleton.defaultSkin = str;
        let localPos = this.node.convertToNodeSpaceAR(WordPos);
        this.nowCreatorTouchItem.setParent(this.node);
        this.nowCreatorTouchItem.setPosition(localPos);
        this.nowCreatorTouchItem.getComponent("showItem").initValue(type, des);
        this.nowCreatorTouchItem.getComponent("showItem").PlayerSpineAnimator(2);
        this.touchStartPos = localPos;
    }

    //移动
    TouchMove(WordPos: cc.Vec2) {

        if (this.nowCreatorTouchItem == null) {
            return;
        }
        //console.log("移动");
        let localPos = this.node.convertToNodeSpaceAR(WordPos);
        this.nowCreatorTouchItem.setPosition(localPos);

        //世界坐标转成局部坐标
        let showPos = this.node_show.convertToNodeSpaceAR(WordPos);
        //this.test.setPosition(showPos); //测试使用
        let nowSize = this.nowCreatorTouchItem.getContentSize();

        //var element: cc.Node = null;
        this.isCanAdsorb = false;
        if (this.adsorbNode != null) { this.adsorbNode.getComponent("showItem").updateState(3) };
        this.adsorbNode = null;

        //检测是否碰撞
        //console.log("到检测这里");

        let treeData = this.treeData.FindAll();
        if (treeData == null) {
            return;
        }
        // console.log(treeData.length);
        for (let index = treeData.length - 1; index >= 0; index--) {
            let element1 = treeData[index].line;

            if(element1 === this.nowCreatorTouchItem){
                console.log("是同一个节点",element1);
                treeData.splice(index, 1);
                continue;                
            }

            let worldPos = element1.children[1].convertToWorldSpaceAR(cc.v2(0, 0));
            let localPos = this.node_show.convertToNodeSpaceAR(worldPos);
            let nodeSize = element1.getComponent("showItem").node_layout.getContentSize();
            // 碰撞检查
            if (Tools.isCollisionWithRect(
                showPos, nowSize.width, nowSize.height,
                localPos, nodeSize.width, nodeSize.height
            )) {
                this.isCanAdsorb = true;
                this.adsorbNode = element1;
                element1.getComponent("showItem").updateState(2);
                break;
            } else {
                element1 = null;
            }

        }


    }

 
    TouchEnd(WordPos: cc.Vec2) {
        //console.log("结束");
        let showPos = this.node_show.convertToNodeSpaceAR(WordPos);

        if (this.node_show.childrenCount == 0) {
            if (this.nowCreatorTouchItem == null) {
                // console.log("创建的为空");
                return;
                //表示没有节点
            }


            if (Math.sqrt(this.touchStartPos.x - showPos.x) * (this.touchStartPos.x - showPos.x) +
                (this.touchStartPos.y - showPos.y) * (this.touchStartPos.y - showPos.y) < 10) {
                this.nowCreatorTouchItem.getComponent("showItem").onDesNode();
                this.isCanAdsorb = false;
                this.nowCreatorTouchItem = null; //变空
                this.adsorbNode = null;
                return;
            }

            let nowSize = this.nowCreatorTouchItem.getContentSize();
            let localPos = cc.v2(0, 0);
            let nodeSize = this.node_show.getContentSize();

            if (Tools.isCollisionWithRect(
                showPos, nowSize.width, nowSize.height,
                localPos, 1700, 455
            )) {
                //console.log("在这个节点里面");
                //this.test.setPosition(showPos); //测试使用
                this.nowCreatorTouchItem.setParent(this.node_show);
                this.nowCreatorTouchItem.setPosition(showPos);


                //判断是否 删除第一个节点
                if (!this.treeData.IsDelFirstNode) {
                    //数据添加
                    let obj = new LineTreenData();
                    obj.index = this.nowItemIndex;
                    obj.value = "";
                    obj.line = this.nowCreatorTouchItem;
                    obj.childList = new Array<LineTreenData>();
                    obj.parentIndexData = new Array<number>();
                    obj.lineAllParentType = new Array<number>();
                    obj.lineAllParentType.push(this.nowCreatorTouchItem.getComponent("showItem").GetType());
                    this.nowCreatorTouchItem.getComponent("showItem").PlayerSpineAnimator(3);
                    obj.parentIndexData.push(this.nowItemIndex);
                    this.treeData.Add(obj, null);

                    this.nowCreatorTouchItem.getComponent("showItem").init(obj);
                    this.root = this.nowCreatorTouchItem;
                    this.adsorbNode = null;
                    this.isCanAdsorb = false;
                    this.nowCreatorTouchItem = null;
                    this.nowItemIndex++;
                    AudioManager.getInstance().playSound("sfx_releasefish",false,1);
                } else {
                    this.treeData.restoreFirstNodeData(false);
                    this.root =  this.nowCreatorTouchItem;
                    this.nowCreatorTouchItem = null;
                }

            } else {
                this.nowCreatorTouchItem.getComponent("showItem").onDesNode();
                this.nowCreatorTouchItem = null; //变空
                this.adsorbNode = null;
                this.isCanAdsorb = false;
                this.treeData.restoreFirstNodeData(true);
            }

        } else {
            if (!this.isCanAdsorb) {
                this.nowCreatorTouchItem.getComponent("showItem").onDesNode();
                this.nowCreatorTouchItem = null; //变空
                if(this.treeData.IsDelChildNode){
                    this.treeData.ChildNodeDelState(true);
                }
            } else if (this.isCanAdsorb) {
                if (this.adsorbNode != null ) {
                    if(this.adsorbNode.getComponent("showItem").GetLayoutLength()>=4){
                        this.nowCreatorTouchItem.getComponent("showItem").onDesNode();
                        this.nowCreatorTouchItem = null; //变空
                        this.nowCreatorTouchItem = null; //变空
                        this.adsorbNode = null;
                        this.isCanAdsorb = false;
                        return;
                    }
                    //console.log(this.adsorbNode);
                    this.adsorbNode.getComponent("showItem").setLayoutChild(this.nowCreatorTouchItem);
                    this.nowCreatorTouchItem.getComponent("showItem").PlayerSpineAnimator(3);
                    this.adsorbNode.getComponent("showItem").updateState(3);

                    //数据添加
                    let parentLineData = this.adsorbNode.getComponent("showItem").Data;
                    let parentList = new Array<number>();

                    let lineAllParentType = new Array<number>();

                    for (let index = 0; index < parentLineData.parentIndexData.length; index++) {
                        const element = parentLineData.parentIndexData[index];
                        parentList.push(element);

                        const nowNodeType = parentLineData.lineAllParentType[index];
                        lineAllParentType.push(nowNodeType);
                    }
                  
                    if(!this.treeData.IsDelChildNode){
                        lineAllParentType.push(this.nowCreatorTouchItem.getComponent("showItem").GetType());
                        parentList.push(this.nowItemIndex);
                        let obj = new LineTreenData();
                        obj.index = this.nowItemIndex;
                        obj.value = "";
                        obj.line = this.nowCreatorTouchItem;
                        obj.childList = new Array<LineTreenData>();
                        obj.parentIndexData = parentList;
                        obj.lineAllParentType = lineAllParentType;
                        this.treeData.Add(obj, obj.parentIndexData);
                        this.nowItemIndex++;
                        this.nowCreatorTouchItem.getComponent("showItem").init(obj);
                        AudioManager.getInstance().playSound("sfx_releasefish",false,1);
                       
                    }else{
                        let delNodeData = this.nowCreatorTouchItem.getComponent("showItem").Data;
                        parentList.push(delNodeData.index);
                        lineAllParentType.push(this.nowCreatorTouchItem.getComponent("showItem").GetType());
                        //parentList.push(nowNodeIndex);
                        this.DelTreeData.parentIndexData = parentList;
                        this.DelTreeData.index = delNodeData.index;
                        this.DelTreeData.value = "";
                        this.DelTreeData.childList = new Array<LineTreenData>();
                        this.DelTreeData.line = this.nowCreatorTouchItem;
                        this.DelTreeData.lineAllParentType = lineAllParentType;
                        this.treeData.Add(this.DelTreeData,parentList);
                        this.nowCreatorTouchItem.getComponent("showItem").init(this.DelTreeData);
                        this.treeData.ChildNodeDelState(true);
                        AudioManager.getInstance().playSound("sfx_releasefish",false,1);
                    }

                    this.nowCreatorTouchItem = null;
                    this.adsorbNode = null;
                    this.isCanAdsorb = false;
                   
                }
            }
        }
        this.node_Mask.active = false;
    }

    //
    OnClickInput(value: string) {
        //console.log(value);
        //if(this.lable_input.string.length >3)
        AudioManager.getInstance().playSound("sfx_buttn",false,1);
        switch (value) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                {
                    if (this.lable_input.string.length < 3) {
                        this.lable_input.string += value;
                    }
                }
                break;
            case "10":
                {
                    let str = "";
                    let count = this.lable_input.string.length;
                    for (let index = 0; index < count - 1; index++) {

                        str += this.lable_input.string[index];
                    }
                    this.lable_input.string = str;

                }
                break;
            case "12":
                {
                   this.onClickKeyBoard();
                }
                break;

        }
    }

    //键盘的回调
    onClickKeyBoard() {

        if (!this.onClickKeyBoardIsOnClick) return;
        this.node_KeyBoard.stopAllActions();
        this.onClickKeyBoardIsOnClick = false;
        if (this.isShow == false) {
            this.node_editNode.children[0].getComponent(cc.Sprite).spriteFrame = this.imput_selected;
            let seq = cc.sequence(

                cc.spawn(
                    cc.moveTo(0.2, 563, -38),
                    cc.fadeIn(0.2),
                ),

                cc.callFunc(function () {
                    this.onClickKeyBoardIsOnClick = true;
                    this.playcursorAniamtor(true);
                }.bind(this))

            );
            this.node_KeyBoard.runAction(seq);
            this.isShow = true;
        } else if (this.isShow) {
            this.node_editNode.children[0].getComponent(cc.Sprite).spriteFrame = this.imput_normal;
            let seq = cc.sequence(
                cc.moveTo(0.2, 563, -901),
                cc.fadeOut(0.2),
                cc.callFunc(function () {
                    this.onClickKeyBoardIsOnClick = true;
                    this.playcursorAniamtor(false);
                }.bind(this))
            );
            this.node_KeyBoard.runAction(seq);
            this.isShow = false;
        }
    }


    //显示状态
    eventshowState(state: boolean) {
        console.log(state);
        if (state) {
            ListenerManager.getInstance().add(ListenerType.ItemTouchStart, this, this.TouchStart.bind(this));
            ListenerManager.getInstance().add(ListenerType.ItemTouchMove, this, this.TouchMove.bind(this));
            ListenerManager.getInstance().add(ListenerType.ItemTouchEnd, this, this.TouchEnd.bind(this));
            ListenerManager.getInstance().add(ListenerType.ItemTouchHave, this, this.touchHave.bind(this));
        } else {
            ListenerManager.getInstance().remove(ListenerType.ItemTouchStart, this, this.TouchStart.bind(this));
            ListenerManager.getInstance().remove(ListenerType.ItemTouchMove, this, this.TouchMove.bind(this));
            ListenerManager.getInstance().remove(ListenerType.ItemTouchEnd, this, this.TouchEnd.bind(this));
            ListenerManager.getInstance().remove(ListenerType.ItemTouchHave, this, this.touchHave.bind(this));
        }

    }

    //提交
    onClicksubmit() {

    }

    //缩放 1 加 2 减
    onClickScale(event: number,customEventData) {
        AudioManager.getInstance().playSound("sfx_buttn",false,1);
        let scale =  this.node_show.getScale();
        console.log(customEventData);
        console.log("scale:"+scale);
        
        switch (customEventData) {
            
            case "1":
                if(scale <=1.5){
                    scale = scale +0.1;
                    this.node_show.setScale(cc.v2(scale,scale));
                }
                
                break;
            case "2":
                    if(scale >= 0.5){
                        scale = scale -0.1;
                        this.node_show.setScale(cc.v2(scale,scale));
                    }
                break;
        }
    }

    onClickScaleSlider(event:cc.Slider,CustomEventData){
        console.log(event.progress);
        let scale =  this.node_show.getScale();
        scale = event.progress +0.5;
        this.node_show.setScale(cc.v2(scale,scale));
    }

    //提交
    OnTiJiao(){
        AudioManager.getInstance().playSound("sfx_buttn",false,1);
        ++this.TijiaoNumber;
        //获取所用数据
        if(this.treeData._data == null){
            UIHelp.showTip(ConsWorld._007);
            this.Failure();
            return;
        }
        let str = this.treeData.FindAllResultType(this.treeData._data);
        if(parseInt( this.lable_input.string) != this.gameAnswer.length){
            UIHelp.showTip(ConsWorld._003);
            this.DataCoursewareAppear(2);
            this.Failure();
            return;
        }
        //对比
        if(str.length != this.gameAnswer.length){
            UIHelp.showTip(ConsWorld._001);
            this.Failure();
            this.DataCoursewareAppear(2);
            return;
        }else{
            let count = str.length;
            for(let i =0; i< count; i++)
            {
                let result =-1;
                for(let j = 0; j< count; j++){
                    if(this.gameAnswer[i] != str[i]){
                        result = 1;
                    }
                   break;
                }
                if(result ==1){
                    UIHelp.showTip(ConsWorld._002);
                    this.Failure();
                    this.DataCoursewareAppear(2);

                    return;
                }
                
            }

        }
        this.Succeed();
    }

    //成功
    Succeed() {
      ListenerManager.getInstance().trigger(ListenerType.onDataCanSave,true);
      UIHelp.showOverTip(1,ConsWorld._004);
      this.node_Mask.active = true;
      this.btn_tijiao.interactable = false;
      this.DataCoursewareAppear(1);


    }

    //失败
    Failure() {
       if(this.TijiaoNumber >=3){
           this.playerHandAnimator();
           this.TijiaoNumber -=3;
       }
    }

    OnClickSubmitData() {
        console.log("到数据发送这里了");
        //发送数据
        let data = { topic: this.topic, topicDes:this.topicDes, gameAnswer: this.gameAnswer,CoursewareKey: ConstValue.CoursewareKey};
        this.SendData(JSON.stringify(data));
    }

    SendData(data) {
        NetWork.getInstance().DetectionNet(data,function (response) {
            // if (response.data == null || response.data.length <= 0) {
            //     // console.log(response.data);
            //     NetWork.getInstance().AddNet(data, function (response) {
            //         if (response.errcode == "0") {
            //             UIHelp.showTip("提交成功");
            //         } else {
            //             UIHelp.showTip("errcode:" + response.errcode);
            //         }
            //     }.bind(this));
            // } else {
            //     let courseware_id = response.data.courseware_id;
            //     NetWork.getInstance().ModifyNet(data, courseware_id, function (response) {
            //         if (response.errcode == "0") {
            //             UIHelp.showTip("提交成功");
            //         } else {
            //             UIHelp.showTip("errcode:" + response.errcode);
            //         }
            //     }.bind(this));
            // }
        }.bind(this));
    }

     /**
      * 日志上报
      * @param type 1 成功 2 错误
      */
     DataCoursewareAppear(type: number) {
         this.num_answerState = type;
         if(type == 2){
             this.dataReport.answer = "2";
             return;
         }
        if(type == 1){
            this.dataReport.answer = JSON.stringify(this.gameAnswer);
            this.dataReport.result = 1;
           this.LogReport();

        }
       

            
        
    }

    onDes(){
        ListenerManager.getInstance().removeAll(this);
    }

    //显示题目描述
    showTipicDes(){
        AudioManager.getInstance().playSound("sfx_buttn",false,1);
        let self =this;
        this.node_topicDes.stopAllActions();
        this.btn_xila.interactable = false;
        if (this.topicDesShowState == false) {
            this.node_topicDes.children[1].setRotation(0);
            let seq = cc.sequence(
                cc.moveTo(0.1, 0, 478),
                cc.callFunc(function () {
                    this.btn_xila.interactable = true;
                    this.topicDesShowState = true;
                }.bind(this))

            );
            this.node_topicDes.runAction(seq);
        } else if (this.topicDesShowState) {
            this.node_topicDes.children[1].setRotation(180);
            let seq1 = cc.sequence(
                cc.moveTo(0.1, 0, 625),
                cc.callFunc(function () {
                    this.btn_xila.interactable = true;
                    this.topicDesShowState = false;
                }.bind(this))
            );
            this.node_topicDes.runAction(seq1);
        }
    }


     /* 播放手动画 */
     playerHandAnimator(){
         this.node_Mask.active = true;
         this.node_hand.active = true;
        let pos = this.node_hand.getPosition();
        this.node_hand.stopAllActions();

        let seq = cc.sequence(
            cc.repeat(cc.sequence(
                cc.moveTo(0.2,pos.x +20,pos.y -20),
                cc.moveTo(0.2,pos.x ,pos.y),
            ),3),
            cc.delayTime(0.5),
            cc.callFunc(function(){
                this.node_Mask.active = false;
                this.node_hand.active = false;
            }.bind(this))
        );

        // 让节点左右来回移动，并重复5次
        this.node_hand.runAction(seq);

    }

    playcursorAniamtor(state:boolean){
        if(state){
            if(this.node_cursor.active == false){
                this.node_cursor.active = true;
                this.node_cursor.stopAllActions();
                this.node_cursor.runAction(cc.repeatForever(cc.blink(0.5,1)));
            }
        }else{
            this.node_cursor.stopAllActions();
            this.node_cursor.active = false;
        }

    }

    onEndGame() {
        let answer = 0;
        answer = this.num_answerState;
        if(this.num_answerState == 0){
            answer = 4;
        }

        //如果已经上报过数据 则不再上报数据
        if (DataReporting.isRepeatReport) {
            let eventValue =  this.LogReportDataPackage();
            DataReporting.getInstance().dispatchEvent('addLog', {
                eventType: 'clickSubmit',
                eventValue: JSON.stringify(eventValue)
            });
            DataReporting.isRepeatReport = false;
        }


        //eventValue  0为未答题   1为答对了    2为答错了或未完成
        DataReporting.getInstance().dispatchEvent('end_finished', { eventType: 'activity', eventValue: answer });
    }

    /* 成功日志上报 */
    LogReport(){
        this.num_answerState = 1;
        this.dataReport.answer = "true";
        this.dataReport.result = 1;

        this.eventValue.result = 1;
        this.eventValue.levelData = new Array<DataReport>();
        this.eventValue.levelData.push(this.dataReport);
        
        DataReporting.getInstance().dispatchEvent('addLog', {
            eventType: 'clickSubmit',
            eventValue: JSON.stringify(this.eventValue)
        });
        DataReporting.isRepeatReport = false; // 关闭日志上报
         
    }

     /* 日志上报数据封装 */
     LogReportDataPackage():EventValue{
        if(!DataReporting.isRepeatReport){ //日志已经上报
            return this.eventValue;
        }else{
            if(this.num_answerState ==0){
                this.dataReport.result = 4;
                this.eventValue.result = 4;
            }else{
                this.dataReport.result = 2;
                this.eventValue.result = 2;
            }
            this.dataReport.answer = "true";
            this.dataReport.result = 1;
            
            this.eventValue.levelData = new Array<DataReport>();
            this.eventValue.levelData.push(this.dataReport);
            return  this.eventValue;
        }
    }
}
