import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import SubmissionPanel from "./SubmissionPanel";
import { NetWork } from "../../Http/NetWork";
import { UIHelp } from "../../Utils/UIHelp";
import { ConstWord } from '../../Data/ConstWord';
import GamePanel from './GamePanel';
import { GameData } from '../../Data/GameData';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeacherPanel extends BaseUI {
    protected static className = "TeacherPanel";

    // onLoad () {}

    @property(cc.Node)
    private node_treeParent: cc.Node = null;

    @property(cc.Node)
    private node_fourParent: cc.Node = null;

    @property(cc.Node)
    private node_blockParent: cc.Node = null;

    @property(cc.Node)
    private node_typeParent: cc.Node = null;


    @property(cc.Prefab)
    private prefab_greenBlock: cc.Prefab = null;



   




    private List_treeData: Array<Array<cc.Node>> = null;
    private List_fourData: Array<Array<cc.Node>> = null;

    private v2_blockPos: Array<Array<cc.Vec2>> = null;
    private num_type: number = 3;
    
    private nowShowParent:cc.Node = null;



    start() {
        //this.getNet();
        this.List_treeData = new Array<Array<cc.Node>>(5);
        this.List_fourData = new Array<Array<cc.Node>>(5);
        this.init();
        this.AddListener();
        this.initPos();
        this.GetNetData();
        this.initParentPos(this.num_type);
    }

    init() {
        this.num_type = 3;
        this.node_treeParent.active = true;
        this.node_fourParent.active = false;

    }

    AddListener() {
        let treeCount = this.node_treeParent.childrenCount;
        for (let i = 0; i < treeCount; i++) {
            let editBox = this.node_treeParent.children[i];
            editBox.on("editing-did-ended", this.OnClickGetEditEndTree.bind(this, i));
            editBox.on("editing-return", this.OnClickGetEditEndTree.bind(this, i));

        }

        let foureCount = this.node_fourParent.childrenCount;
        for (let i = 0; i < foureCount; i++) {
            let editBox = this.node_fourParent.children[i];
            editBox.on("editing-did-ended", this.OnClickGetEditEndTree.bind(this, i));
            editBox.on("editing-return", this.OnClickGetEditEndTree.bind(this, i));

        }


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
                let obj = this.node_blockParent.children[index * type + i];
                obj.setPosition(pos);
            }
        }
    }

    NodeClear(type: number) {
        for (let index = 0; index < type; index++) {
            for (let i = 0; i < type; i++) {
                let obj = this.node_blockParent.children[index * type + i];
                for (let j = 0; j < obj.childrenCount; j++) {
                    obj.children[j].active = false;
                }
            }
        }
    }

    GetNetData(){
        try{
            NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.title_id, "GET", "application/json;charset=utf-8", function (err, response) {

                if(Array.isArray( response.data)){
    
                }else{
                    NetWork.courseware_id = response.data.courseware_id;
                    if (NetWork.empty) {//如果URL里面带了empty参数 并且为true  就立刻清除数据
                        this.ClearNet();
                        return;
                    }
                    let courseware_content = JSON.parse(response.data.courseware_content);
        
                   
                    this.LoadData(courseware_content.type,courseware_content.topic);
                }
               
            }.bind(this));
        }catch(e){
            console.error(e.message);
        }
       

    }





    //加载服务器数据数据
    LoadData(type: number, data: Array<string>) {
        this.num_type = type;

        this.SetToggleTypeStr(type);

        this.loadEditData(data);

        this.LoadSHowAllBlock(data);

    }

    loadEditData(arrStr:Array<string>){
        let treeCount = this.nowShowParent.childrenCount;
        for (let i = 0; i < treeCount; i++) {
            let editBox = this.nowShowParent.children[i].getComponent(cc.EditBox);
            if(arrStr.length> i){
                editBox.string = arrStr[i];
            }
        }

    }

    LoadSHowAllBlock(arrStr:Array<string>) {
        let count = arrStr.length;
        for (let index = 0; index < count; index++) {
            let hength = parseInt(arrStr[index]);
            this.LoadSHowBlock(index,hength);
        }
    }

    LoadSHowBlock(CustmeEventData,blockCount:number){
        if (this.List_treeData[CustmeEventData] == null) {
            let blocklist = new Array<cc.Node>();
            this.List_treeData[CustmeEventData] = blocklist;
        }

        let startPos = this.GetPos(CustmeEventData, this.num_type);
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
                let obj = cc.instantiate(this.prefab_greenBlock);
                obj.setParent(this.node_blockParent.children[CustmeEventData]);
                obj.setPosition(0, offes * index);
                this.List_treeData[CustmeEventData].push(obj);
                obj.active = true;
            }
        }
    }



    setPanel() {//设置教师端界面

    }

    //上传课件按钮
    onBtnSaveClicked() {
        UIManager.getInstance().showUI(SubmissionPanel);
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.title_id, "GET", "application/json;charset=utf-8", function (err, response) {
            console.log("消息返回" + response);
            if (!err) {
                let res = response;
                if (Array.isArray(res.data)) {
                    this.setPanel();
                    return;
                }
                let content = JSON.parse(res.data.courseware_content);
                NetWork.courseware_id = res.data.courseware_id;
                if (NetWork.empty) {//如果URL里面带了empty参数 并且为true  就立刻清除数据
                    this.ClearNet();
                } else {
                    if (content != null) {
                        this.setPanel();
                    } else {
                        this.setPanel();
                    }
                }
            }
        }.bind(this), null);
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

    OnClickGetEditEndTree(CustmeEventData, editBox) {
        console.log("CustmeEventData:" + CustmeEventData);
        console.log("editBox:" + editBox.string);

        let creatorLength = this.examineValue(editBox.string);
        if (creatorLength == 0) {
            editBox.string = "";
        } else {
            editBox.string = creatorLength.toString();
        }

        if (this.List_treeData[CustmeEventData] == null) {
            let blocklist = new Array<cc.Node>();
            this.List_treeData[CustmeEventData] = blocklist;
        }

        let startPos = this.GetPos(CustmeEventData, this.num_type);
        let data = this.List_treeData[CustmeEventData];
        let count = data.length;

        for (let index = 0; index < count; index++) {
            const element = data[index];
            if (element != null) {
                element.active = false;
            }

        }

        let offes = 70;
        for (let index = 0; index < creatorLength; index++) {
            if (index < count) {
                data[index].setPosition(0, offes * index);
                data[index].active = true;
                //data[index].setSiblingIndex(CustmeEventData*10 +index);
            } else {
                let obj = cc.instantiate(this.prefab_greenBlock);
                obj.setParent(this.node_blockParent.children[CustmeEventData]);
                obj.setPosition(0, offes * index);
                this.List_treeData[CustmeEventData].push(obj);
                obj.active = true;
            }
        }
    }



    OnClickGetEditEndFour(event: cc.EditBox, CustmeEventData) {

    }

    //检查
    examineValue(value) {
        if (value == "") return 0;
        if (isNaN(value)) return 0;
        if (this.num_type < parseInt(value)) { return this.num_type }
        else return parseInt(value);
    }

    //
    SetToggleType(event: any) {
        this.NodeClear(this.num_type);
        var name = event.node.name;
        let parent = null;
        switch (name) {
            case "1":
                this.num_type = 3;
                this.node_treeParent.active = true;
                this.node_fourParent.active = false;
                parent = this.node_treeParent;
                break;
            case "2":
                this.num_type = 4;
                this.node_treeParent.active = false;
                this.node_fourParent.active = true;
                parent = this.node_fourParent;

                break;
            default:
                break;
        }

        this.initParentPos(this.num_type);
        this.ChengTypeLoadBlock(parent);
    }

    SetToggleTypeStr(type:number){

        let parent = null;
        let name = "";
        if(type == 3){
            this.node_typeParent.children[0].getComponent(cc.Toggle).isChecked = true;
            name = "1";
        }else if( type ==4){
            name ="2";
            this.node_typeParent.children[1].getComponent(cc.Toggle).isChecked = true;
        }
        switch (name) {
            
            case "1":
                this.num_type = 3;
                this.node_treeParent.active = true;
                this.node_fourParent.active = false;
                this.nowShowParent = this.node_treeParent;
                break;
            case "2":
                this.num_type = 4;
                this.node_treeParent.active = false;
                this.node_fourParent.active = true;
                this.nowShowParent = this.node_fourParent;

                break;
            default:
                break;
        }
    }

    //
    ChengTypeLoadBlock(nodeParent: cc.Node) {
        let count = nodeParent.childrenCount;
        for (let index = 0; index < count; index++) {
            const element = nodeParent.children[index];
            let editBox = element.getComponent(cc.EditBox);
            this.OnClickGetEditEndTree(index, editBox);
        }
    }

    /* 获取起始坐标点 */
    GetPos(index: number, type: number) {
        let numX = index % type;
        let numY = parseInt((index / type).toString());
        return this.v2_blockPos[numY][numX];
    }


    OnClickDetection() {
        //
        let parent: cc.Node = null;
        if (this.num_type == 3) {
            parent = this.node_treeParent;
        } else {
            parent = this.node_fourParent;
        }
        let result = 0;
        //高
        for (let index = 0; index < parent.childrenCount; index++) {
            const editBox = parent.children[index].getComponent(cc.EditBox);
            if (parseInt(editBox.string) == this.num_type) {
                result = 1;
                break;
            }

        }
        if (result == 0) {
            UIHelp.showTip(ConstWord._001);
            return;
        }
        result = 0;
        //长
        for (let index = 0; index < this.num_type; index++) {
            let have = true;
            for (let i = 0; i < this.num_type; i++) {
                const editBox = parent.children[index * this.num_type + i].getComponent(cc.EditBox);
                if (editBox.string == "") {
                    have = false;
                    break;
                }
            }
            if (have) {
                result = 1;
                break;
            }


        }

        if (result == 0) {
            UIHelp.showTip(ConstWord._001);
            return;
        }

        result = 0;
        //长
        for (let index = 0; index < this.num_type; index++) {
            let have = true;
            for (let i = 0; i < this.num_type; i++) {
                const editBox = parent.children[i * this.num_type + index].getComponent(cc.EditBox);
                if (editBox.string == "") {
                    have = false;
                    break;
                }
            }
            if (have) {
                result = 1;
                break;
            }


        }

        if (result == 0) {
            UIHelp.showTip(ConstWord._001);
            return;
        }


        let SaveData = new Array<string>();

        for (let index = 0; index < parent.childrenCount; index++) {
            const editBox = parent.children[index].getComponent(cc.EditBox);
            SaveData.push(editBox.string);

        }


        GameData.getInstance().topic = SaveData;
        GameData.getInstance().type = this.num_type;
        UIManager.getInstance().showUI(GamePanel);

    }



   

}
