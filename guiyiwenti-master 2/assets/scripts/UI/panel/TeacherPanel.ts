import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import { NetWork } from "../../Http/NetWork";
import { UIHelp } from "../../Utils/UIHelp";
import { GameData } from "../../Data/GameData";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { LogWrap } from "../../Utils/LogWrap";
import { SelectTip } from "./SelectTip";
import GamePanel from "./GamePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeacherPanel extends BaseUI {
    protected static className = "TeacherPanel";

    @property(cc.Toggle)
    monkeyMethod: Array<cc.Toggle> = [];
    @property(cc.Toggle)
    peopleMethod: Array<cc.Toggle> = [];
    @property(cc.EditBox)
    totoalNum: cc.EditBox = null;
    @property(cc.EditBox)
    num: cc.EditBox = null;
    @property(cc.EditBox)
    timeNum: cc.EditBox = null;
    @property(cc.EditBox)
    method1: Array<cc.EditBox> = [];
    @property(cc.EditBox)
    method2: Array<cc.EditBox> = [];

    private lastString = "";
    private laseEditbox = null;

    // onLoad () {}

    start() {
        this.node.getChildByName("gameScene").getComponent(cc.Label).string = "猴子 + 桃";
        this.getNet();
        ListenerManager.getInstance().add(ListenerType.GameMethodSelect, this, this.onGameMethodSelect);
    }

    setPanel() {//设置教师端界面

    }

    setEditBoxText() {
        let gameData = GameData.getInstance();
        this.totoalNum.string = gameData.totalNum;
        this.timeNum.string = gameData.time;
        this.num.string = gameData.num;
        let equation1: Array<string> = gameData.method1.split(";")
        let equation2: Array<string> = gameData.method2.split(";")
        this.setMethodEditBoxString(this.method1, equation1);
        this.setMethodEditBoxString(this.method2, equation2);
    }

    setMethodEditBoxString(editArray: Array<cc.EditBox>, equation: Array<string>) {
        editArray[0].string = equation[0].slice(0, equation[0].indexOf("/"));
        editArray[1].string = equation[0].slice(equation[0].indexOf("/") + 1, equation[0].indexOf("="));
        editArray[2].string = equation[0].slice(equation[0].indexOf("=") + 1);
        editArray[3].string = equation[1].slice(0, equation[0].indexOf("/"));
        editArray[4].string = equation[1].slice(equation[0].indexOf("/") + 1, equation[0].indexOf("="));
        editArray[5].string = equation[1].slice(equation[0].indexOf("=") + 1);
    }

    onGameMethodSelect(event) {
        let label = this.node.getChildByName("gameScene").getComponent(cc.Label);
        if (GameData.getInstance().gameScene == 1) {
            label.string = "人 + 树";
        } else if (GameData.getInstance().gameScene == 0) {
            label.string = "猴子 + 桃";
        }
        if (event.state == 0) {
            for (let index = 0; index < this.monkeyMethod.length; index++) {
                this.monkeyMethod[index].isChecked = true;
            }
            for (let index = 0; index < this.peopleMethod.length; index++) {
                this.peopleMethod[index].isChecked = false;
            }
        } else {
            for (let index = 0; index < this.monkeyMethod.length; index++) {
                this.monkeyMethod[index].isChecked = false;
            }
            for (let index = 0; index < this.peopleMethod.length; index++) {
                this.peopleMethod[index].isChecked = true;
            }
        }
    }

    textChanged(text, editbox, customEventData) {
        if (!(this.laseEditbox === editbox)) this.lastString = "";
        if (GameData.getInstance().gameScene == null) {
            UIHelp.showTip("请先选择主题元素");
            editbox.string = this.lastString;
            return;
        }
        this.laseEditbox = editbox;
        let re = /^[1-9]+[0-9]*]*$/;
        if (!re.test(text) && text != "") {
            UIHelp.showTip("请输入正整数");
            editbox.string = this.lastString;
            return;
        } else {
            this.lastString = text;
        }
        if (this.timeNum.string != "" && this.totoalNum.string != "" && this.num.string != "") {
            this.method1[0].string = this.totoalNum.string;
            this.method1[1].string = this.num.string;
            this.method1[4].string = this.timeNum.string;
            this.method2[0].string = this.totoalNum.string;
            this.method2[1].string = this.timeNum.string;
            this.method2[4].string = this.num.string;
            this.textChangedEnd();
        }
    }

    textChangedEnd(text?, editbox?, customEventData?) {
        if (this.method1[0].string != "" && this.method1[1].string != "") {
            this.method1[2].string = (parseInt(this.method1[0].string) / parseInt(this.method1[1].string)).toString();
            this.method1[3].string = this.method1[2].string;
        }
        if (this.method1[3].string != "" && this.method1[4].string != "") {
            this.method1[5].string = (parseInt(this.method1[3].string) / parseInt(this.method1[4].string)).toString();
        }
        if (this.method2[0].string != "" && this.method2[1].string != "") {
            this.method2[2].string = (parseInt(this.method2[0].string) / parseInt(this.method2[1].string)).toString();
            this.method2[3].string = this.method2[2].string;
        }
        if (this.method2[3].string != "" && this.method2[4].string != "") {
            this.method2[5].string = (parseInt(this.method2[3].string) / parseInt(this.method2[4].string)).toString();
        }
    }

    //提交
    onBtnSaveClicked() {
        let gameData = GameData.getInstance();
        if (this.totoalNum.string == "" || this.timeNum.string == "") {
            UIHelp.showTip("有信息还没有填写哦");
            return;
        }
        let temp: Array<cc.EditBox> = [];
        let index = 0
        temp = temp.concat(this.method1).concat(this.method2);
        for (; index < temp.length; index++) {
            const element = temp[index];
            if (element.string == "") break;
        }
        if (index < temp.length) {
            UIHelp.showTip("有信息还没有填写哦");
            return;
        }
        if (parseInt(this.num.string) > 9) {
            UIHelp.showTip("输入的时间需要小于十");
            return;
        }
        if (parseInt(this.timeNum.string) > 8) {
            UIHelp.showTip("输入的时间需要小于九");
            return;
        }
        if (this.method1[2].string.indexOf(".") != -1 || this.method1[5].string.indexOf(".") != -1 || this.method2[2].string.indexOf(".") != -1 || this.method2[5].string.indexOf(".") != -1) {
            UIHelp.showTip("结果中不允许有小数");
            return;
        }
        gameData.totalNum = this.totoalNum.string;
        gameData.time = this.timeNum.string;
        if (this.method1[1].string == gameData.time) {
            gameData.methodTime = 2;
            gameData.num = this.method2[1].string;
        } else {
            gameData.methodTime = 1;
            gameData.num = this.method1[1].string;
        }
        gameData.method1 = this.method1[0].string + "/" + this.method1[1].string + "=" + this.method1[2].string + ";" + this.method1[3].string + "/" + this.method1[4].string + "=" + this.method1[5].string;
        gameData.method2 = this.method2[0].string + "/" + this.method2[1].string + "=" + this.method2[2].string + ";" + this.method2[3].string + "/" + this.method2[4].string + "=" + this.method2[5].string;
        UIManager.getInstance().showUI(GamePanel);
    }

    onAddMethodClicked() {
        UIManager.getInstance().showUI(SelectTip);
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.title_id, "GET", "application/json;charset=utf-8", function (err, response) {
            console.log("消息返回" + response);
            if (!err) {
                let res = response;
                if (Array.isArray(res.data)) {
                    GameData.getInstance().gameScene = 0;
                    this.onGameMethodSelect({ state: 0 });
                    this.setPanel();
                    return;
                }
                let content = JSON.parse(res.data.courseware_content);
                NetWork.courseware_id = res.data.courseware_id;
                if (NetWork.empty) {//如果URL里面带了empty参数 并且为true  就立刻清除数据
                    this.ClearNet();
                } else {
                    if (content != null) {
                        let gameData = GameData.getInstance();
                        gameData.gameScene = content.gameScene;
                        gameData.method1 = content.method1;
                        gameData.method2 = content.method2;
                        gameData.methodTime = content.methodTime;
                        gameData.num = content.num;
                        gameData.time = content.time;
                        gameData.totalNum = content.totalNum;
                        ListenerManager.getInstance().trigger(ListenerType.GameMethodSelect, { state: gameData.gameScene });
                        this.setEditBoxText();
                    } else {
                        GameData.getInstance().gameScene = 0;
                        this.onGameMethodSelect({ state: 0 });
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
}
