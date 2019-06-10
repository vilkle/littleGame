import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import SubmissionPanel from "./SubmissionPanel";
import { NetWork } from "../../Http/NetWork";
import { LogWrap } from "../../Utils/LogWrap";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { Tools } from "../../UIComm/Tools";
import TreeData from '../../Data/TreeData';
import { LineTreenData } from '../../Data/TreeData';
import { GameData } from '../../Data/GameData';
import { ConstValue } from '../../Data/ConstValue';
import { UIHelp } from '../../Utils/UIHelp';
import { ConsWorld } from '../../Data/ConstWorld';

const { ccclass, property } = cc._decorator;


export class ItemLineData {
    public index: number = null; //索引
    public value: string = null;  //值
    public line: cc.Node = null; //
    public child: Array<ItemLineData> = null;
    public parentIndexData: Array<number> = null;
};

@ccclass
export default class TeacherPanel extends BaseUI {
    protected static className = "TeacherPanel";

    @property(cc.Node)
    node_show: cc.Node = null; //显示

    @property(cc.Node)
    test: cc.Node = null; //测试节点

    @property(cc.Node)
    node_Mask: cc.Node = null; //遮罩

    @property(cc.Node)
    node_SubmissionPanel: cc.Node = null; //

    @property(cc.Node)
    node_CtreatorParent: cc.Node = null; //

    @property(cc.Node)
    node_ShowItem: cc.Node = null; //显示的item

    @property(cc.Node)
    node_footNode: cc.Node = null;  //主题目

    @property(cc.EditBox)
    EditBox_topicDes: cc.EditBox = null;  //题目Des

    private nowCreatorTouchItem: cc.Node = null;

    private topicDes = ""; //描述文本

    //存储需要检测的队列
    private detectionList: Array<ItemLineData> = [];
    // onLoad () {}


    //是否可以吸附
    private isCanAdsorb: boolean = false; // 是否可以吸附

    private adsorbNode: cc.Node = null; //可吸附的节点

    private nowItemIndex: number = 0; //当前的索引
    private touchStartPos: cc.Vec2 = cc.v2(0, 0); //拖动开始的坐标
    private treeData: TreeData = null;
    private root: cc.Node = null;

    private inContentTouchParent: cc.Node = null; // 显示在树形图中 拖动时候的父物体
    private DelTreeData:LineTreenData = null;


    start() {


        this.eventshowState(true);
        // ListenerManager.getInstance().add(ListenerType.TeacherFanhuiBtnClick, this, this.eventshowState);
        this.treeData = new TreeData();
        this.LoadData();
        this.DelTreeData = new LineTreenData();
        this.DelTreeData.childList = new Array<LineTreenData>();
        this.DelTreeData.parentIndexData = Array<number>();
        this.DelTreeData.lineAllParentType = Array<number>();

    }

    LoadData() {
        NetWork.getInstance().DetectionNetTeacher (function (response) {
            
            if (Array.isArray(response.data)) {

            } else {
                NetWork.courseware_id = response.data.courseware_id;
                let courseware_content = JSON.parse(response.data.courseware_content);

                if (NetWork.empty) {//如果URL里面带了empty参数 并且为true  就立刻清除数据
                    this.ClearNet();
                    return;
                }
                this.loadshowData(courseware_content);
            }

        }.bind(this));


    }

    touchHave(obj: cc.Node, WordPos: cc.Vec2, lineData: LineTreenData, parent: cc.Node) {
        if (GameData.getInstance().nowState != 1) {
            return;
        }
        let thisNodeParent = obj.getParent().getParent();
        this.inContentTouchParent = parent;
        if( this.inContentTouchParent.getComponent(cc.Layout)  !=null){
            this.inContentTouchParent.getComponent(cc.Layout).updateLayout();
        }else{
            console.log(1111111111);
        }
       
        this.nowCreatorTouchItem = obj;
        this.nowCreatorTouchItem.setParent(this.node);
        let localPos = this.node.convertToNodeSpaceAR(WordPos);
        this.nowCreatorTouchItem.setPosition(localPos);

        if (thisNodeParent.getComponent("showItem") != null) {
            thisNodeParent.getComponent("showItem").updateSprite();
            //console.log("更新了");
        }

        this.treeData.Del(lineData, lineData.parentIndexData, lineData.index);
        this.DelTreeData = lineData;
        //console.log(this.detectionList);
        this.touchStartPos = localPos;
        //this.node_Mask.active = true;

    }

    //拖拽开始
    TouchStart(WordPos: cc.Vec2, type: number, des: string) {
        if (GameData.getInstance().nowState != 1) {
            return;
        }
        let self = this;
        console.log("teacher type:" + type);
        this.nowCreatorTouchItem = cc.instantiate(self.node_ShowItem);
        let localPos = self.node.convertToNodeSpaceAR(WordPos);
        this.nowCreatorTouchItem.setParent(self.node);
        this.nowCreatorTouchItem.setPosition(localPos);
        this.nowCreatorTouchItem.getComponent("showItem").initValue(type, des);
        this.touchStartPos = localPos;
    }

    //移动
    TouchMove(WordPos: cc.Vec2) {

        if (GameData.getInstance().nowState != 1) {
            return;
        }
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

        var element: cc.Node = null;
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
            element = treeData[index].line;
            let worldPos = element.children[1].convertToWorldSpaceAR(cc.v2(0, 0));
            let localPos = this.node_show.convertToNodeSpaceAR(worldPos);
            let nodeSize = element.getComponent("showItem").node_layout.getContentSize();

            // 碰撞检查
            if (Tools.isCollisionWithRect(
                showPos, nowSize.width, nowSize.height,
                localPos, nodeSize.width, nodeSize.height
            )) {
                this.isCanAdsorb = true;
                this.adsorbNode = element;
                element.getComponent("showItem").updateState(2);
                //console.log(element.name);
                // console.log("碰撞到了");
                // console.log("this.nowCreatorTouchItem:"+nowSize);
                break;
            } else {
                element = null;
            }

        }
    }

    TouchEnd(WordPos: cc.Vec2) {
        //console.log("结束");
        let showPos = this.node_show.convertToNodeSpaceAR(WordPos);

        if (GameData.getInstance().nowState != 1) {
            return;
        }

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
                    obj.parentIndexData.push(this.nowItemIndex);
                    this.treeData.Add(obj, null);

                    this.nowCreatorTouchItem.getComponent("showItem").init(obj);
                    this.root = this.nowCreatorTouchItem;
                    this.adsorbNode = null;
                    this.isCanAdsorb = false;
                    this.nowCreatorTouchItem = null;
                    this.nowItemIndex++;
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
                        this.DelTreeData.parentIndexData = parentList;
                        this.nowCreatorTouchItem.getComponent("showItem").init(this.DelTreeData);
                        this.treeData.ChildNodeDelState(true);
                    }

                    this.nowCreatorTouchItem = null;
                    this.adsorbNode = null;
                    this.isCanAdsorb = false;
                   
                }
            }
        }
        this.node_Mask.active = false;
        //console.log(this.root.children[1].height);

        if (this.node_show.height < this.root.children[1].height) {
            this.node_show.height = this.root.children[1].height;
            this.node_show.getParent().height = this.root.children[1].height;
        }
    }

    OnClicktiJiao() {
        if (this.treeData._data == null) {
            UIHelp.showTip(ConsWorld._005);
            return;
        }

        if (this.topicDes == "") {
            UIHelp.showTip(ConsWorld._006);
            return;
        }
        let result = this.treeData.FindAllResult(this.treeData._data);
        this.node_SubmissionPanel.active = true;
        this.node_SubmissionPanel.getComponent("SubmissionPanel").init(result);

        let str = this.treeData.FindAllResultType((this.treeData._data));
        GameData.getInstance().gameAnswer = str;
        let topic = new Array<string>();
        let count = this.node_footNode.childrenCount;
        for (let index = 0; index < count; index++) {
            const element = this.node_footNode.children[index];
            topic.push(element.getComponent("HeadItem").value);
        }

        GameData.getInstance().topic = topic;
        GameData.getInstance().topicDes = this.topicDes;
        console.log(str);
        console.log(topic);

    }

    //显示状态
    eventshowState(state: boolean) {
        console.log(state);
        if (state) {
            ListenerManager.getInstance().add(ListenerType.ItemTouchStart, this, this.TouchStart);
            ListenerManager.getInstance().add(ListenerType.ItemTouchMove, this, this.TouchMove);
            ListenerManager.getInstance().add(ListenerType.ItemTouchEnd, this, this.TouchEnd);
            ListenerManager.getInstance().add(ListenerType.ItemTouchHave, this, this.touchHave);

        } else {
            ListenerManager.getInstance().remove(ListenerType.ItemTouchStart, this, this.TouchStart);
            ListenerManager.getInstance().remove(ListenerType.ItemTouchMove, this, this.TouchMove);
            ListenerManager.getInstance().remove(ListenerType.ItemTouchEnd, this, this.TouchEnd);
            ListenerManager.getInstance().remove(ListenerType.ItemTouchHave, this, this.touchHave);


        }

    }

    onClickEdotEnd() {
        this.topicDes = this.EditBox_topicDes.string;
    }




    //删除课件数据  一般为脏数据清理
    ClearNet() {
        let jsonData = { courseware_id: NetWork.courseware_id };
        NetWork.getInstance().httpRequest(NetWork.CLEAR, "POST", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                UIHelp.showTip("答案删除成功");
            }
        }.bind(this), JSON.stringify(jsonData));
    }

    loadshowData(data) {
        try {
            //题干
            this.EditBox_topicDes.string = data.topicDes;
            this.topicDes = data.topicDes;
            //foot
            this.node_CtreatorParent.getComponent("CreatorItem").initFootNode(data.topic);
           
            //节点
            this.CreatorNodeTree(data.gameAnswer);
        } catch (e) {
            console.error(e.message);
        }


    }

    CreatorNodeTree(data: Array<string>) {

        // for(let i = 0; i < data.length; i++){
        //     let str  = data[i];
        //     for(){}
        // }

        // let obj = new LineTreenData();
        // obj.index = this.nowItemIndex;
        // obj.value = "";
        // obj.line = this.nowCreatorTouchItem;
        // obj.childList = new Array<LineTreenData>();
        // obj.parentIndexData = parentList;
        // obj.lineAllParentType = lineAllParentType;
        // this.treeData.Add(obj, parentLineData.parentIndexData);
    }


}
