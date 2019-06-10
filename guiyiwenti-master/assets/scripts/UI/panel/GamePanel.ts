import { BaseUI } from "../BaseUI";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { ConstValue } from "../../Data/ConstValue";
import { UIManager } from "../../Manager/UIManager";
import UploadAndReturnPanel from "./UploadAndReturnPanel";
import { GameData } from "../../Data/GameData";
import { UIHelp } from "../../Utils/UIHelp";
import { NetWork } from "../../Http/NetWork";
import { OverTips } from "../Item/OverTips";
import { AffirmTips } from "../Item/affirmTips";
import SpeLabel from "../Item/SpeLabel";
import NumBtton from "../Item/NumButton";
import Card from "../Item/Card";
import DataReporting from "../../Data/DataReporting";
import { AudioManager } from "../../Manager/AudioManager";

const { ccclass, property } = cc._decorator;

const delayTime = 0.80;


@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";

    @property(cc.Label)
    labels: Array<cc.Label> = []; //展示方案
    @property(cc.Label)
    methods: Array<cc.Label> = []; //输入框
    @property(NumBtton)
    numButtons: Array<NumBtton> = []; //按键

    @property(cc.Prefab)
    card: cc.Prefab = null;
    @property(sp.Skeleton)
    bgSpine: sp.Skeleton = null;
    @property(cc.Node)
    monkey: cc.Node = null;
    @property(cc.Node)
    people: cc.Node = null;
    @property(SpeLabel)
    speLabel: SpeLabel = null;

    private curMethod = "";
    private timeUnit = "";
    private numUnit = "";
    private passLevel = [];
    private isSelect = false;
    private isAnswer = false;

    private anwserInfo = {
        isResult: 1,
        isLavel: 1,
        levelData: [

        ],
        result: 2,
    }

    start() {
        DataReporting.getInstance().addEvent('end_game', this.onEndGame.bind(this));
        GameData.getInstance().gameState = 0;
        AudioManager.getInstance().playSound("sfx_gyopn", false, 1);
        for (let index = 0; index < this.numButtons.length; index++) {
            const element = this.numButtons[index];
            element.setBtnEnable(false);
        }
        if (ConstValue.IS_TEACHER) {
            this.praseGameReportData();
            ListenerManager.getInstance().trigger(ListenerType.OnEditStateSwitching, { state: "1" });
            UIManager.getInstance().showUI(UploadAndReturnPanel);
            this.setBgInAnimation();
        } else {
            this.getNet();
        }
        ListenerManager.getInstance().add(ListenerType.SpeLabelTextChange, this, this.setSubmitBtnState);
    }

    onEndGame() {
        //如果已经上报过数据 则不再上报数据
        if (DataReporting.isRepeatReport) {
            DataReporting.getInstance().dispatchEvent('addLog', {
                eventType: 'clickSubmit',
                eventValue: JSON.stringify(this.anwserInfo)
            });
            DataReporting.isRepeatReport = false;
        }
        //eventValue  0为未答题   1为答对了    2为答错了或未完成
        let value = 0;
        if (!this.isAnswer) {
            value = 0;
        } else {
            value = GameData.getInstance().gameState == 1 ? 1 : 2;
        }
        DataReporting.getInstance().dispatchEvent('end_finished', { eventType: 'activity', eventValue: 0 });
    }

    praseGameReportData() {
        for (let index = 0; index < 1; index++) {
            let info = {
                subject: "",
                answer: "",
                result: 4,
            };
            this.anwserInfo.levelData.push(info);
        }
    }

    onDestroy() {
        super.onDestroy();
        ListenerManager.getInstance().trigger(ListenerType.OnEditStateSwitching, { state: "0" });
    }

    initMethodView() {
        let gameData = GameData.getInstance();
        if (gameData.gameScene == 0) {
            this.timeUnit = "天";
            this.numUnit = "只";
        } else {
            this.timeUnit = " h";
            this.numUnit = "个";
        }
        this.setMethodView();
    }

    createCards() {
        let time = parseInt(GameData.getInstance().time);
        let cards = [];
        if (time > 4) {
            let max = time < 7 ? 3 : 4;
            let startX = max == 4 ? -665 : max == 3 ? -520 : 0;
            for (let index = 0; index < max; index++) {
                let cardNode = cc.instantiate(this.card);
                let card: Card = cardNode.getComponent(Card);
                card.init(index + 1);
                cardNode.parent = this.node.getChildByName("cards");
                cardNode.position = cc.v2(startX + (index % max) * 260, 350);
                cards.push(card);
            }
            let startX1 = (time - max) == 4 ? -665 : (time - max) == 3 ? -540 : (time - max) == 2 ? -405 : (time - max) == 1 ? -265 : 0;
            for (let index = max; index < time; index++) {
                let cardNode = cc.instantiate(this.card);
                let card: Card = cardNode.getComponent(Card);
                card.init(index + 1);
                cardNode.parent = this.node.getChildByName("cards");
                cardNode.position = cc.v2(startX1 + (index % max) * 260, 210);
                cards.push(card);
            }
        } else {
            let startX = time == 4 ? -665 : time == 3 ? -540 : time == 2 ? -405 : time == 1 ? -265 : 0;
            for (let index = 0; index < time; index++) {
                let cardNode = cc.instantiate(this.card);
                let card: Card = cardNode.getComponent(Card);
                card.init(index + 1);
                cardNode.parent = this.node.getChildByName("cards");
                cardNode.position = cc.v2(startX + (index % 4) * 260, 280);
                cards.push(card);
            }
        }
        for (let index = 0; index < cards.length; index++) {
            const element: Card = cards[index] as Card;
            element.node.active = false;
            let action = cc.delayTime(delayTime + 0.05 * index);
            let seq = cc.sequence(action, cc.callFunc(() => {
                element.node.active = true;
                element.setAnimation();
            }));
            this.node.runAction(seq);
        }
        this.scheduleOnce(() => {
            this.speLabel.onBtnClick();
            this.speLabel.setString("");
        }, 2);
    }

    setBgInAnimation() {
        for (let index = 0; index < this.numButtons.length; index++) {
            const element = this.numButtons[index];
            element.node.active = false;
        }
        this.bgSpine.node.active = true;
        let track = this.bgSpine.setAnimation(0, "ruchang", false);
        this.createCards();
        this.setKeyBoardAnimation();
        this.setSubmitInAnimation();
        this.setMonkeyOrPersonTotalAnimation(GameData.getInstance().gameScene == 0 ? this.monkey : this.people);
        this.scheduleOnce(() => {
            this.node.getChildByName("bgMask").active = true;
            this.node.getChildByName("tipBtn").active = true;
            this.scheduleOnce(() => {
                this.node.getChildByName("tipBtn").active = false;
                this.node.getChildByName("bgMask").active = false;
                if (!this.isSelect) {
                    this.curMethod = GameData.getInstance().method1;
                    this.initMethodView();
                    this.setChangeMethodInAnimation();
                    this.setTipInAnimation();
                    this.setMonkeyOrPersonyInAnimation(GameData.getInstance().gameScene == 0 ? this.monkey : this.people);
                }
            }, 3);
        }, 2);
    }

    setKeyBoardAnimation() {
        for (let index = 0; index < this.numButtons.length; index++) {
            const element = this.numButtons[index];
            let action = cc.delayTime(delayTime + 0.05 * element.appearTime);
            let seq = cc.sequence(action, cc.callFunc(() => {
                element.node.active = true;
                element.setAction();
            }));
            this.node.runAction(seq);
        }

    }

    setSubmitInAnimation() {
        let submitNode = this.node.getChildByName("sumbmit");
        let action = cc.delayTime(delayTime);
        let seq = cc.sequence(action, cc.callFunc(() => {
            submitNode.active = true;
            let action1 = cc.scaleTo(0.25, 1.14);
            let action2 = cc.scaleTo(0.4, 0.88);
            let action3 = cc.scaleTo(0.25, 1);
            let seq1 = cc.sequence(action1, action2, action3);
            submitNode.scale = 0.22;
            submitNode.runAction(seq1);
        }));
        this.node.runAction(seq);
    }

    setTipInAnimation() {
        let tip = this.node.getChildByName("tip");
        tip.active = true;
        for (let index = 0; index < tip.children.length; index++) {
            const element = tip.children[index];
            element.active = false;
        }
        for (let index = 0; index < tip.children.length; index++) {
            const element = tip.children[index];
            let pos: cc.Vec2 = cc.v2(element.position.x, element.position.y);;
            let action = cc.delayTime(0);
            let seq = cc.sequence(action, cc.callFunc(() => {
                element.active = true;
                element.position = cc.v2(pos.x, pos.y - 51.94);
                element.scale = 0.16;

                let scale1 = cc.scaleTo(0.25, 1.08, 1.08);
                let move1 = cc.moveTo(0.25, cc.v2(pos.x, pos.y + 48.32));
                let spa1 = cc.spawn(scale1, move1);

                let scale2 = cc.scaleTo(0.15, 1.01, 1.1);
                let move2 = cc.moveTo(0.15, cc.v2(pos.x, pos.y));
                let spa2 = cc.spawn(scale2, move2);

                let scale3 = cc.scaleTo(0.25, 1);

                let seq1 = cc.sequence(spa1, spa2, scale3);
                element.runAction(seq1);
            }));
            this.node.runAction(seq);
        }
        let editbox1 = this.node.getChildByName("bgAnswer1");
        let editbox2 = this.node.getChildByName("bgAnswer2");
        let editboxArray = [editbox1, editbox2];
        for (let index = 0; index < editboxArray.length; index++) {
            const element = editboxArray[index];
            element.active = false;
            let action = cc.delayTime(0);
            let seq = cc.sequence(action, cc.callFunc(() => {
                element.active = true;
                element.runAction(cc.fadeIn(0.35));
                element.children[2].getComponent(cc.Label).string = "(" + (GameData.getInstance().gameScene == 0 ? "个" : "棵") + ")"
                for (let index = 0; index < this.numButtons.length; index++) {
                    const element = this.numButtons[index];
                    element.setBtnEnable(true);
                }
            }));
            this.node.runAction(seq);
        }
    }

    setMonkeyOrPersonTotalAnimation(node: cc.Node) {
        node.children[2].active = false;
        node.children[3].active = false;
        let action = cc.delayTime(delayTime * 2);
        let seq = cc.sequence(action, cc.callFunc(() => {
            node.children[2].active = true;
            node.children[3].active = true;
            node.children[2].runAction(cc.fadeIn(0.35));
            node.children[3].runAction(cc.fadeIn(0.35));
            node.children[3].getComponent(cc.Label).string = GameData.getInstance().totalNum + (GameData.getInstance().gameScene == 0 ? "个" : "棵")
        }));
        this.node.runAction(seq);
    }

    setMonkeyOrPersonyInAnimation(node: cc.Node) {
        node.children[0].active = false;
        node.children[1].active = false;
        let action = cc.delayTime(0);
        for (let index = 0; index < 2; index++) {
            let pos: cc.Vec2 = cc.v2(node.children[index].position.x, node.children[index].position.y);;
            let seq = cc.sequence(action, cc.callFunc(() => {
                node.children[index].active = true;
                node.children[index].position = cc.v2(pos.x, pos.y - 141.74);
                node.children[index].scale = 0.2

                let scale1 = cc.scaleTo(0.25, 1.2);
                let move1 = cc.moveTo(0.25, cc.v2(pos.x, pos.y + 30.62));
                let spa1 = cc.spawn(scale1, move1);

                let scale2 = cc.scaleTo(0.3, 1);
                let move2 = cc.moveTo(0.3, cc.v2(pos.x, pos.y));
                let spa2 = cc.spawn(scale2, move2);
                let seq1 = cc.sequence(spa1, spa2);
                node.children[index].runAction(seq1);

            }));
            this.node.runAction(seq);
        }
        let seq = cc.sequence(action, cc.callFunc(() => {
            node.children[2].active = true;
            node.children[3].active = true;
            node.children[2].runAction(cc.fadeIn(0.35));
            node.children[3].runAction(cc.fadeIn(0.35));
            node.children[3].getComponent(cc.Label).string = GameData.getInstance().totalNum + (GameData.getInstance().gameScene == 0 ? "个" : "棵")
        }));
        this.node.runAction(seq);
    }

    setChangeMethodInAnimation() {
        let changeMethodNode = this.node.getChildByName("changMethod");
        changeMethodNode.active = false;
        let action = cc.delayTime(0);
        let pos: cc.Vec2 = cc.v2(changeMethodNode.position.x, changeMethodNode.position.y);;
        let seq = cc.sequence(action, cc.callFunc(() => {
            changeMethodNode.active = true;
            let scale1 = cc.scaleTo(0.15, 0.58, 0.73);
            let move1 = cc.moveTo(0.15, cc.v2(pos.x, pos.y));
            let spa1 = cc.spawn(scale1, move1);

            let scale2 = cc.scaleTo(0.1, 1.59, 2.04);
            let move2 = cc.moveTo(0.1, cc.v2(pos.x, pos.y + 94.01));
            let spa2 = cc.spawn(scale2, move2);

            let scale3 = cc.scaleTo(0.15, 1.59, 2.2);
            let move3 = cc.moveTo(0.15, cc.v2(pos.x, pos.y + 93.11));
            let spa3 = cc.spawn(scale3, move3);

            let scale4 = cc.scaleTo(0.25, 1.0, 1.0);
            let move4 = cc.moveTo(0.25, cc.v2(pos.x, pos.y));
            let spa4 = cc.spawn(scale4, move4);

            let scale5 = cc.scaleTo(0.25, 1.24, 0.9);
            let scale6 = cc.scaleTo(0.15, 1.0, 1.0);

            let seq1 = cc.sequence(spa1, spa2, spa3, spa4, scale5, scale6);
            changeMethodNode.scaleX = 0.22;
            changeMethodNode.scaleY = 0.18;
            changeMethodNode.position = cc.v2(pos.x, pos.y - 46.55);

            changeMethodNode.runAction(seq1);
        }));
        this.node.runAction(seq);
    }

    setBtnState(enable: boolean) {
        for (let index = 0; index < this.numButtons.length; index++) {
            const element = this.numButtons[index];
            element.setBtnEnable(enable);
        }
        for (let index = 0; index < this.methods.length; index++) {
            const element = this.methods[index];
            let speLabel = element.node.getParent().getComponent(SpeLabel);
            speLabel.setCursor(enable);
            speLabel.setEnable(enable);
        }
        let submitBtn = this.node.getChildByName("sumbmit").getComponent(cc.Button) as cc.Button;
        submitBtn.enableAutoGrayEffect = true;
        submitBtn.interactable = enable;
    }

    setSubmitBtnState(event) {
        let index = 0
        for (; index < 2; index++) {
            if (this.methods[index].string == "") break;
        }
        let index1 = 0;
        for (; index1 < 4; index1++) {
            if (this.methods[index1].string == "") break;
        }
        let submitBtn = this.node.getChildByName("sumbmit").getComponent(cc.Button) as cc.Button;
        submitBtn.interactable = index1 >= 4;
        this.methods[2].node.getParent().getComponent(SpeLabel).setEnable(index >= 2);
        this.methods[3].node.getParent().getComponent(SpeLabel).setEnable(index >= 2);
        let tip = this.node.getChildByName("tip");
        tip.children[2].children[0].color = index >= 2 ? cc.color(96, 40, 40, 255) : cc.color(96, 96, 96, 255);
        tip.children[3].children[0].color = index >= 2 ? cc.color(96, 40, 40, 255) : cc.color(96, 96, 96, 255);
        this.monkey.children[1].getComponent(cc.Sprite).setState(index >= 2 ? 0 : 1);
        let bgAnswer2 = this.node.getChildByName("bgAnswer2");
        bgAnswer2.getComponent(cc.Sprite).setState(index >= 2 ? 0 : 1);
        bgAnswer2.children[2].color = index >= 2 ? cc.color(175, 104, 104, 255) : cc.color(96, 96, 96, 255);
    }

    setMethodView() {
        let gameData = GameData.getInstance();
        for (let index = 0; index < this.methods.length; index++) {
            this.methods[index].string = "";
        }
        if (GameData.getInstance().methodTime == 2) {
            if (this.curMethod == gameData.method1) {
                this.labels[0].string = 1 + this.timeUnit;
                this.labels[1].string = gameData.num + this.numUnit;
            } else {
                this.labels[0].string = gameData.time + this.timeUnit;
                this.labels[1].string = 1 + this.numUnit;
            }
        } else {
            if (this.curMethod == gameData.method1) {
                this.labels[0].string = gameData.time + this.timeUnit;
                this.labels[1].string = 1 + this.numUnit;
            } else {
                this.labels[0].string = 1 + this.timeUnit;
                this.labels[1].string = gameData.num + this.numUnit;
            }
        }
        this.labels[2].string = 1 + this.numUnit;
        this.labels[3].string = 1 + this.timeUnit;
    }

    onBtnSubmitClick() {
        AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        this.isAnswer = true;
        let method = this.methods[0].string + "=" + this.methods[1].string + ";" + this.methods[2].string + "=" + this.methods[3].string;
        let levelData = {
            subject: this.curMethod,
            ansewer: method,
            result: 2
        }
        this.anwserInfo.levelData[this.passLevel.length] = levelData;
        if (method == this.curMethod) {
            if (this.passLevel.length == 0) {
                this.passLevel.push(this.curMethod);
            } else if (this.passLevel[0] != this.curMethod) {
                this.passLevel.push(this.curMethod);
            }
            if (this.passLevel.length == 1) {
                UIManager.getInstance().showUI(OverTips, () => {
                    let tips = UIManager.getInstance().getUI(OverTips) as OverTips;
                    // tips.setOnlyOneBtnType("换个方案试试");
                    tips.init(1, "恭喜你，作答正确", () => {
                        this.node.getChildByName("changMethod").active = false;
                        this.onBtnChangeMethodClick();
                    });
                    tips.setBtnChangeMethod(true);
                });
                this.setBtnState(false);
                this.anwserInfo.levelData[0].result = 1;
                this.anwserInfo.result = 1;
                DataReporting.getInstance().dispatchEvent('addLog', {
                    eventType: 'clickSubmit',
                    eventValue: JSON.stringify(this.anwserInfo)
                });
                DataReporting.isRepeatReport = false;
            } else if (this.passLevel.length == 2) {
                GameData.getInstance().gameState = 1;
                this.setBtnState(false);
                this.anwserInfo.levelData[0].result = 1;
                this.anwserInfo.result = 3;
                DataReporting.getInstance().dispatchEvent('addLog', {
                    eventType: 'clickSubmit',
                    eventValue: JSON.stringify(this.anwserInfo)
                });
                DataReporting.isRepeatReport = false;
                UIManager.getInstance().showUI(OverTips, () => {
                    let tips = UIManager.getInstance().getUI(OverTips) as OverTips;
                    tips.init(1, "宝贝，你表现真棒～", () => { });
                });
            }
        } else {
            UIHelp.showTip("宝贝，思考一下再试试，加油！");
        }
    }

    onBtnChangeMethodClick() {
        AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        UIHelp.showTip("宝贝，更换方法成功，赶快试试吧！");
        this.setBtnState(true);
        let submitBtn = this.node.getChildByName("sumbmit").getComponent(cc.Button) as cc.Button;
        submitBtn.enableAutoGrayEffect = true;
        submitBtn.interactable = false;
        if (this.passLevel.length != 0) this.node.getChildByName("changMethod").active = false;
        if (this.curMethod == GameData.getInstance().method1) {
            this.curMethod = GameData.getInstance().method2;
        } else {
            this.curMethod = GameData.getInstance().method1;
        }
        this.setMethodView();
        this.speLabel.onBtnClick();
        this.speLabel.setString("");
    }

    onBtnSeletMethod() {
        AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        this.isSelect = true;
        this.curMethod = GameData.getInstance().method1;
        this.initMethodView();
        this.setChangeMethodInAnimation();
        this.setTipInAnimation();
        this.setMonkeyOrPersonyInAnimation(GameData.getInstance().gameScene == 0 ? this.monkey : this.people);
        this.node.getChildByName("tipBtn").active = false;
        this.node.getChildByName("bgMask").active = false;
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
                    this.praseGameReportData();
                    let gameData = GameData.getInstance();
                    gameData.gameScene = content.gameScene;
                    gameData.method1 = content.method1;
                    gameData.method2 = content.method2;
                    gameData.methodTime = content.methodTime;
                    gameData.num = content.num;
                    gameData.time = content.time;
                    gameData.totalNum = content.totalNum;
                    this.setBgInAnimation();
                }
            } else {
                // this.setPanel();
            }
        }.bind(this), null);
    }
}
