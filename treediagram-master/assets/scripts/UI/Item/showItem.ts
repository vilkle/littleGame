import { ListenerType } from '../../Data/ListenerType';
import { ListenerManager } from '../../Manager/ListenerManager';
import { ItemLineData } from '../panel/TeacherPanel';
import { LineTreenData } from '../../Data/TreeData';
import { Tools } from '../../UIComm/Tools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class showItem extends cc.Component {

    @property(cc.Node)
    Image_showSprite: cc.Node = null;

    @property(cc.Node)
    node_layout: cc.Node = null;

    @property(cc.Node)
    node_detection: cc.Node = null; // 检测到的状态 

    @property(cc.Node)
    node_OnClick: cc.Node = null;


    @property(cc.Node)
    node_lineParent: cc.Node = null; //实线

    @property(cc.Label)
    label_value: cc.Label = null;



    @property(sp.Skeleton)
    sp_fash: sp.Skeleton = null;

    private nowChildCount = 0; //当前孩子的长度

    private node_ParentLayout: cc.Layout = null;
    public Data: LineTreenData = null;

    private type: number = -1;
    private value: string = "";
    private touchWordPos: cc.Vec2 = cc.v2(0, 0);
    private isTouchStart = false;

    start() {
        this.node_OnClick.on(cc.Node.EventType.TOUCH_START, this.TouchStart.bind(this));
        this.node_OnClick.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove.bind(this));
        this.node_OnClick.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd.bind(this));
        this.node_OnClick.on(cc.Node.EventType.TOUCH_END, this.TouchEnd.bind(this));
    }

    NowNodeUpdateParent() {
        this.node_ParentLayout = this.node.getParent().getComponent(cc.Layout);
    }

    init(data: LineTreenData) {
        this.Data = data;
    }

    GetType(): number {
        //console.log(this.type);
        return this.type;
    }

    //初始化值
    initValue(type: number, value: string) {
        //console.log("到了初始化" + type + " " + value);
        this.type = type;
        this.label_value.string = value;
        if (this.sp_fash != null) {
            let str = '0' + (type + 1);
            this.sp_fash.defaultSkin = str;
        }
    }

    //更新精灵位置位置
    updateSprite() {

        this.node.children[1].getComponent(cc.Layout).updateLayout();
        this.node.getComponent(cc.Layout).updateLayout();
        let height = this.node_layout.getContentSize().height;


        if (this.node.getParent().getComponent(cc.Layout) != null) {
            this.node.getParent().getComponent(cc.Layout).updateLayout();

        }

        this.Image_showSprite.children[0].setPosition(this.Image_showSprite.children[0].x, -(height / 2));
        let showItem = this.node.getParent().getParent().getComponent("showItem");


        if (showItem != null) {
            showItem.updateSprite();

        } else {
            // console.log("height:"+height);
            // console this.Image_showSprite.children[0].getPosition()
        }

        if (this.node_ParentLayout != null) {
            // console.log("跟新坐标位置");
            // this.node_ParentLayout.node.setPosition(148, 0);
        }
        this.showLine();
    }

    //
    /**
     * 更新当前状态
     * @param state 1 选中 2.检测到 3. 正常状态
     */
    updateState(state: number) {

        switch (state) {
            case 1:
                this.node_OnClick.active = true;
                break;
            case 2:
                {
                    this.nowChildCount = this.node_layout.childrenCount + 1;
                    //console.log(this.nowChildCount);
                    if (this.nowChildCount > 4) {
                        console.log("长度大于4个");
                        return;
                    }
                    if (this.nowChildCount != 0) {
                        this.node_detection.children[0].active = true;
                        let heigth = 0;
                        if (this.node_layout.childrenCount <= 0) {
                            heigth = 0;
                        } else {
                            heigth = Math.abs(this.node_layout.children[this.node_layout.childrenCount - 1].y) + 140;
                        }

                        let element = this.node_detection.children[0];

                        for (let i = 0; i < 3; i++) {
                            element.children[i].active = false;
                        }
                        heigth = Math.abs(heigth);

                        if (heigth <= 10 && heigth >= 0) {
                            element.children[2].active = true;

                            element.active = true;
                        } else if (heigth > 10) {
                            element.active = true;
                            element.children[1].active = true;
                            //element.setContentSize(element.width,  Math.abs(heigth/2));
                            element.children[1].setContentSize(element.width, Math.abs(heigth / 2));
                            element.children[1].children[0].getComponent(cc.Widget).updateAlignment();
                            element.children[1].setPosition(cc.v2(22.4, 0));

                        }

                    }
                }
                break;
            case 3:
                {
                    this.node_detection.children[0].active = false;

                }
                break;
        }



    }

    TouchStart(event: cc.Touch) {

        let WorldPos = event.getLocation();
        this.touchWordPos = WorldPos;
        //ListenerManager.getInstance().trigger(ListenerType.ItemTouchHave, this.node, WorldPos, this.Data, this.node.getParent().getParent());
        // if (this.node_ParentLayout != null) {
        //     this.node_ParentLayout.enabled = false;
        // }
    }

    TouchMove(event: cc.Touch) {
        let WorldPos = event.getLocation();
        let number = Tools.GetDistance(this.touchWordPos, WorldPos);
        if (!this.isTouchStart) {
            if (number > 100) {
                ListenerManager.getInstance().trigger(ListenerType.ItemTouchHave, this.node, WorldPos, this.Data, this.node.getParent().getParent());
                this.isTouchStart = true;
            }
        } else {
            ListenerManager.getInstance().trigger(ListenerType.ItemTouchMove, WorldPos);
            //this.isTouchStart = false;
        }

    }

    TouchEnd(event: cc.Touch) {
        if (this.isTouchStart) {
        let WorldPos = event.getLocation();
        ListenerManager.getInstance().trigger(ListenerType.ItemTouchEnd, WorldPos);
        this.isTouchStart = false;
        // if (this.node_ParentLayout != null) {
        //     this.node_ParentLayout.enabled = true;
        // }
        }

    }

    //关闭当前显示的灰色线条
    CloseShowState() {
        this.node_detection.children[this.nowChildCount - 1].active = false;
    }

    setLayoutChild(childNode: cc.Node) {
        this.node_layout.getComponent(cc.Layout).enabled = true;
        this.node_lineParent.setContentSize(this.node_layout.getContentSize());
        //设置孩子
        childNode.setParent(this.node_layout);

        childNode.x = 230 - 140;
        // console.log("childNodeParent:"+ childNode.getParent());
        childNode.getComponent("showItem").updateSprite();
        childNode.getComponent("showItem").NowNodeUpdateParent();
    }

    onDestroy() {
        // console.log("删除");
    }

    onDesNode() {
        this.node_OnClick.off(cc.Node.EventType.TOUCH_START, this.TouchStart.bind(this));
        this.node_OnClick.off(cc.Node.EventType.TOUCH_MOVE, this.TouchMove.bind(this));
        this.node_OnClick.off(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd.bind(this));
        this.node_OnClick.off(cc.Node.EventType.TOUCH_END, this.TouchEnd.bind(this));
        //this.node.removeChild(this.node, true);
        this.node.destroy();
    }

    showLine() {
        let count = this.node_layout.childrenCount;
        for (let index = 0; index < this.node_lineParent.childrenCount; index++) {
            this.node_lineParent.children[index].active = false;
        }

        for (let index = 0; index < this.node_layout.childrenCount; index++) {
            const element = this.node_lineParent.children[index];
            let heigth = this.node_layout.children[index].y;
            console.log("heigth:" + heigth);
            for (let i = 0; i < 3; i++) {
                element.children[i].active = false;
            }

            if (heigth < 10 && heigth > -10) {

                element.children[2].active = true;

                element.active = true;
            } else if (heigth > 10) {
                element.active = true;
                element.children[0].active = true;
                element.setContentSize(element.width, heigth);
                element.children[0].getComponent(cc.Widget).updateAlignment();

            } else if (heigth < -10) {
                element.active = true;
                element.children[1].active = true;
                element.setContentSize(element.width, Math.abs(heigth));
                element.children[1].setContentSize(element.width, Math.abs(heigth / 2));
                element.children[1].setPosition(cc.v2(22.4, 0));

            }
        }

        //     if (count == 1) {
        //         this.node_lineParent.children[0].active = true;
        //     }
        //     else if(count ==2){
        //          for(let i=0;i<2;i++){
        //             const element = this.node_lineParent.children[i+2];
        //             let heigth = Math.abs(this.node_layout.children[i].y);
        //             element.setContentSize(element.width, heigth);
        //             element.active = true;
        //             element.children[0].getComponent(cc.Widget).updateAlignment();
        //          }
        //     }else if (count == 3) {
        //         this.node_lineParent.children[0].active = true;

        //        this.node_lineParent.children[2].setContentSize(
        //            this.node_lineParent.width, Math.abs(this.node_layout.children[0].y));
        //        this.node_lineParent.children[3].setContentSize(
        //            this.node_lineParent.width, Math.abs(this.node_layout.children[2].y));

        //        this.node_lineParent.children[2].children[0].getComponent(cc.Widget).updateAlignment();
        //        this.node_lineParent.children[3].children[0].getComponent(cc.Widget).updateAlignment();
        //        this.node_lineParent.children[2].active = true;
        //        this.node_lineParent.children[3].active = true;

        //    }
        //     else if (count == 4) {
        //         for (let index = 1; index < count + 1; index++) {
        //             const element = this.node_lineParent.children[index];
        //            // console.log(this.node_layout.children[index - 1].y);
        //            let heigth = Math.abs(this.node_layout.children[index - 1].y);
        //            let layoutHeigth = Math.abs(this.node_layout.children[index - 1].getContentSize().height);
        //             console.log("高度："+heigth);
        //             console.log("layoutHeigth"+layoutHeigth);

        //             element.setContentSize(element.width, heigth);
        //             console.log(" element ContentSize:",element.getContentSize());
        //             element.active = true;
        //             element.children[0].getComponent(cc.Widget).updateAlignment();
        //             // console.log(element.name);
        //             // console.log(element.height);
        //         }

        //     } 

    }


    PlayerSpineAnimator(state: number) {

        if (this.sp_fash == null) {
            console.log("spine 动画为空");
            return;
        }

        switch (state) {
            case 1:
                Tools.playSpine(this.sp_fash, "idle", true, function () { }.bind(this)); //初始状态
                break;
            case 2:
                Tools.playSpine(this.sp_fash, "drag", true, function () { }.bind(this)); //抖动
                break;
            case 3:
                Tools.playSpine(this.sp_fash, "in_stay", false, function () { }.bind(this)); //拖拽完成
                break;

            default:
                break;
        }


    }

    /* 获取layout 的长度 */
    GetLayoutLength() {
        return this.node_layout.childrenCount;
    }




}
