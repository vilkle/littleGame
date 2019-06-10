import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { ConstValue } from "../../Data/ConstValue";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeadItem extends cc.Component {

    @property(cc.Node)
    node_touch: cc.Node = null;

    @property(cc.EditBox)
    EditBox_item: cc.EditBox = null;

    @property(cc.Label)
    label_Des: cc.Label = null;

    @property
    private state: number = 1; // 2,拖动 1。 显示输入状态

    private IsTouchStart: boolean = false; //是否开始拖拽
    private isCanClick: boolean = true; // 是否可以点击
    @property
    private type: number = 0;
    private value: string = "";



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

       // this.state = 2;
        
        this.value = "主题" + this.type;
        this.label_Des.string = "主题" + this.type;

        this.node_touch.on(cc.Node.EventType.TOUCH_START, this.TouchStart.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_END, this.TouchEnd.bind(this));
    }

    init(type) {
        this.type = type-1;
        this.value = "主题" + (this.type-1);
        this.label_Des.string = "主题" + (this.type-1);
    }

    studentInit(type: number, des: string) {
        this.type = type;
        this.value = des;
        this.label_Des.string = des;
        this.state =1;
        this.onClickBtnChengState();
        
    }

    TouchStart(event: cc.Touch) {
        console.log("start");
        console.log("this.state:"+this.state);

        if (this.state == 2) {
            return;
        }

        let WorldPos = event.getLocation();
        // console.log("拖动开始");
        this.IsTouchStart = true;
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchStart, WorldPos, this.type, this.value);
        this.isCanClick = false;
        this.getComponent(cc.Button).interactable = false;
    }

    TouchMove(event: cc.Touch) {
        if (!this.IsTouchStart) {
            return;
        }
        let WorldPos = event.getLocation();
        // console.log("拖动");
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchMove, WorldPos);
    }

    TouchEnd(event: cc.Touch) {
        let WorldPos = event.getLocation();
        this.IsTouchStart = false;
        this.isCanClick = true;
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchEnd, WorldPos);
        this.getComponent(cc.Button).interactable = true;
        if (this.state == 1) {
            //this.OffTouch();
            this.onClickBtnChengState();
        }
    }

    onClickBtnChengState() {

        if (this.EditBox_item == null) {
            return;
        }
        switch (this.state) {
            case 2:
                {
                    this.EditBox_item.node.active = false;
                    this.node_touch.active = true;
                    this.state = 1;
                }
                break;
            case 1:
                {
                    this.EditBox_item.node.active = true;
                    this.node_touch.active = false;
                    //this.OffTouch();
                    this.state = 2;
                }
                break;
        }
    }

    OffTouch() {
        this.node_touch.off(cc.Node.EventType.TOUCH_START, this.TouchStart.bind(this));
        this.node_touch.off(cc.Node.EventType.TOUCH_START, this.TouchMove.bind(this));
        this.node_touch.off(cc.Node.EventType.TOUCH_START, this.TouchEnd.bind(this));
    }

    onEditBoxEnd() {
        if(this.EditBox_item.string == ""){
            return;
        }
        this.label_Des.string = this.EditBox_item.string;
        this.value = this.EditBox_item.string;
    }






}
