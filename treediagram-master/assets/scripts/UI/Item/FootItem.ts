import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import { ConstValue } from "../../Data/ConstValue";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootItem extends cc.Component {

    @property(cc.Node)
    node_touch: cc.Node = null;

    @property(cc.Label)
    label_Des: cc.Label = null;

    @property
    private state: number = 2; // 2,拖动 1。 显示输入状态

    private IsTouchStart: boolean = false; //是否开始拖拽
    @property
    private type: number = 0;
    private value: string = "";

    
    @property(sp.Skeleton)
    private sp_animator:sp.Skeleton=null; // 2,拖动 1。 显示输入状态



    start() {

       
        this.node_touch.on(cc.Node.EventType.TOUCH_START, this.TouchStart.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd.bind(this));
        this.node_touch.on(cc.Node.EventType.TOUCH_END, this.TouchEnd.bind(this));
    }

    studentInit(type: number, des: string) {
        this.type = type;
        this.value = des;
        this.label_Des.string = des;
        this.state =1;
       
    }

    TouchStart(event: cc.Touch) {
        console.log("start");
        console.log("this.state:"+this.state);
      
        let WorldPos = event.getLocation();
        // console.log("拖动开始");
        this.IsTouchStart = true;
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchStart, WorldPos, this.type, this.value);
    }

    TouchMove(event: cc.Touch) {
        if (!this.IsTouchStart) {
            return;
        }
        let WorldPos = event.getLocation();
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchMove, WorldPos);
    }

    TouchEnd(event: cc.Touch) {
        let WorldPos = event.getLocation();
        this.IsTouchStart = false;
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchEnd, WorldPos);
     
    }

}
