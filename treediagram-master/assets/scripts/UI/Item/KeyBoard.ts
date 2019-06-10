import { ListenerManager } from '../../Manager/ListenerManager';
import { ListenerType } from '../../Data/ListenerType';
import { toString } from '../../collections/arrays';

const {ccclass, property} = cc._decorator;

@ccclass
export default class KeyBoard extends cc.Component {

    @property(cc.Node)
    node_keys:cc.Node = null;

    @property(cc.Node)
    node_keyDel:cc.Node = null;

    @property(cc.Node)
    node_keyConfirm:cc.Node = null;
    
    @property(cc.Node)
    node_parent:cc.Node =null;


    start () {
        for (let index = 0; index < 12; index++) {
            let node = null;
            let nowIndex = index +1;
            if(index==9){
                node = cc.instantiate(this.node_keyDel);
            }else if(index==10){
                node = cc.instantiate(this.node_keys);
                node.children[0].children[0].getComponent(cc.Label).string="0";
                nowIndex  = 0;
            }
            else if(index==11){
                node = cc.instantiate(this.node_keyConfirm);
            } 
            else{
                node = cc.instantiate(this.node_keys);
                node.children[0].children[0].getComponent(cc.Label).string= (index +1).toString();
            }
            
            node.setParent(this.node_parent);
            node.on("click",this.OnClickKeyBoard.bind(this,nowIndex));
        }
    }

    OnClickKeyBoard(customEventData){
       // console.log(customEventData);
        ListenerManager.getInstance().trigger(ListenerType.OnClickKeyBoard,customEventData.toString());
    }

    // update (dt) {}
}
