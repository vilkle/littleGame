import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";


const {ccclass, property} = cc._decorator;

@ccclass
export default class CreatorItem extends cc.Component {


    @property(cc.Node)
    node_item:cc.Node = null; //
    
    @property(cc.Node)
    node_parent:cc.Node= null;

    @property(cc.Node)
    node_function:cc.Node = null; //功能按键

    @property(cc.Node)
    node_touch:cc.Node = null; //拖动的节点

    @property(cc.Node)
    node_show:cc.Node = null; //显示

    @property(cc.Node)
    node_ShowItem:cc.Node= null; //显示的item

    @property(cc.Button)
    btn_Creator:cc.Button = null;

    private nowCreatorTouchItem:cc.Node = null; 

    

    @property(cc.Button)
    btn_Del:cc.Button = null;

   


    start () {
       this.detectionState(4);
       let data =Array<string>();
       for(let i = 0; i<4; i++){
        data.push("主题"+(i+1));
       }
       this.initFootNode(data);

    }

    OnClickCreatorItem(){
        let count:number = this.node_parent.childrenCount;
        let obj =  cc.instantiate(this.node_item);
        obj.setParent(this.node_parent);
        obj.getComponent("HeadItem").init(this.node_parent.childrenCount);
        this.detectionState(count+1);
        
    }

    OnClickDelItem(){
        let count:number = this.node_parent.childrenCount;
       let obj =  this.node_parent.children[this.node_parent.childrenCount-1];
       obj.destroy();
       this.detectionState(count-1);
    }
   
    //检测状态
    detectionState(count:number){
        this.node_parent.getComponent(cc.Layout).updateLayout();
        if(count >=6){
            this.btn_Creator.interactable = false;
            this.btn_Del.interactable = true;
        }else if(count<5){
            this.btn_Creator.interactable = true;
            this.btn_Del.interactable = false;
        }else{
            this.btn_Creator.interactable = true;
            this.btn_Del.interactable = true;
        }
        let PosX = this.node_parent.getContentSize().width/2 +10;
        this.node_function.setPosition(PosX,0);
    }

    
    initFootNode(topic: Array<string>) {
        if(topic.length <= 4){
            this.btn_Del.interactable = false;
        }
        let count = topic.length;
        for (let index = 0; index < count; index++) {
            if(this.node_parent.childrenCount >index){
                this.node_parent.children[index].getComponent("HeadItem").studentInit(index, topic[index]);
            }else{
            let obj = cc.instantiate(this.node_item);
            obj.setParent(this.node_parent);
            obj.getComponent("HeadItem").studentInit(index, topic[index]);
            }
        }
        this.detectionState(count+1);
    }

   


}
