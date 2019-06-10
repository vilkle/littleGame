import { Delegate } from '../Manager/ListenerManager';

const { ccclass, property } = cc._decorator;

export class LineTreenData {
    public index: number = null; //索引
    public value: string = null;  //值
    public line: cc.Node = null; //
    public childList: Array<LineTreenData> = null;
    public parentIndexData: Array<number> = null;
    public lineAllParentType: Array<number> = null;
};

@ccclass
export default class TreeData {

    public _data: LineTreenData = null;// tree 
    private AllData: Array<LineTreenData> = null; // find
    public IsDelFirstNode: boolean = false;
    public IsDelChildNode: boolean = false;
    public DelTree: LineTreenData = null;
    private temporaryList: Array<LineTreenData> = null;
    constructor() {
        // this._data = new LineTreenData();
        // this._data.childList = new Array<LineTreenData>();
        // this._data.parentIndexData = new Array<number>();
        this.AllData = new Array<LineTreenData>();

    }

    /**添加*/
    Add(data: LineTreenData, parentNodeData: Array<number>) {
        try {
            if (data == this._data) return;
            if (this._data == null) {
                this._data = data;
                this.AllData.push(data);
            } else {
                let LineData = this._data;
                if (parentNodeData == null) {
                    console.log("这个是跟节点");
                    return;
                }
                //找到这个节点的父节点  parentNodeData 放了自己
                for (let index = 1; index < parentNodeData.length-1; index++) {
                    const value = parentNodeData[index];
                    let data = this.Find(LineData, value);
                    if (data == null) {
                        console.log("元素错乱，请检查元素的");
                        return null;
                    }
                    LineData = data;
                }
                //表示添加到当前
                if (parentNodeData != null) {
                    if (parentNodeData.length <= 0) {
                        console.log("节点不是root 节点 但是没有父节点");

                    } else if (parentNodeData.length > 0) {

                        if (LineData.childList.length >= 4) {
                            console.log("当前的节点已经添加完成了");
                        } else {

                            if (!this.IsDelChildNode) {
                                this.AllData.push(data);
                                LineData.childList.push(data);
                            } else {
                                this.DelTree.parentIndexData = parentNodeData;
                                LineData.childList.push(this.DelTree);
                                this.AllData.push(this.DelTree);
                                this.AddOneNodeAllChild(this.DelTree);
                                this.DelTree = null;
                                this.IsDelChildNode = false;
                            }

                            console.log("添加成功");
                        }
                    }
                }
                console.log("添加完剩余节点:",this.AllData);

            }
        } catch (e) {
            console.error(e.message);
        }
    }

    /**查找 获取 value 所对应的父节点 */
    /*  FindParentNode(parentNodeData:Array<number>):LineTreenData{
         //数组第一值表示 root 
         var length = parentNodeData.length;
 
         let LineData = this._data;
 
         if(length == 0){
             return LineData;
         }
 
         for (let index = 1; index < length; index++) {
             const value = parentNodeData[index];
             let data = this.Find(LineData,value);
             if(data == null){
                 console.log("元素错乱，请检查元素的");
                 return null;
             }
 
             LineData = data;
         }
 
         return LineData;
     } */

    /**查找最后的孩子数量 */
    FindAllResult(data: LineTreenData) {

        if (data != null) {
            if (data.childList.length <= 0) {
                return 1;
            } else {
                let count = 0;
                for (let i = 0; i < data.childList.length; i++) {
                    count += this.FindAllResult(data.childList[i]);
                }
                return count;
            }
        }

    }

    /**查找最后的孩子数量 */
    FindAllResultType(data: LineTreenData) {
        let strData = new Array<string>();
        let str = this.findOneLineEndType(data).split(",");
        for (let index = 0; index < str.length; index++) {
            const element = str[index];
            if (element != "") {
                strData.push(str[index]);
            }
        }

        return strData;



    }


    private findOneLineEndType(data: LineTreenData) {
        if (data != null) {
            if (data.childList.length <= 0) {
                return data.lineAllParentType.join("");
            } else {
                let str: string = "";
                for (let i = 0; i < data.childList.length; i++) {
                    str += this.findOneLineEndType(data.childList[i]) + ",";
                }
                return str;
            }
        }
    }



    /**查找一个节点上的孩子节点 */
    private Find(data: LineTreenData, DataIndex: number): LineTreenData {

        var length = data.childList.length;
        for (let index = 0; index < length; index++) {
            const element = data.childList[index];
            if (element.index == DataIndex) {
                return element;
            }
        }
        return null;
    }

    /**删除 
     * data 存储自己的父节点位置 包括自己
    */
    Del(data: LineTreenData, parentNodeData: Array<number>, nowDelIndex: number) {
        var length = parentNodeData.length;
        let LineData = this._data;

        if (length == 1) { // 表示根节点
            this.IsDelFirstNode = true;
            this.temporaryList = this.AllData.slice();
            this.AllData = [];
            // this.AllData = this.ExtraData;
            return null;
        }
        //先拿到根节点 从根节点开始找
        for (let index = 1; index < parentNodeData.length-1; index++) {
            const value = parentNodeData[index];
            let data = this.Find(LineData, value);
            if (data == null) {
                console.log("元素错乱，请检查元素的");
                return null;
            }
            LineData = data;
        }

        var count = LineData.childList.length;
        for (let j = 0; j < count; j++) {
            const element = LineData.childList[j];

            if (element.index == nowDelIndex) {
                
              
                this.DelTree = new LineTreenData();
                this.DelTree.childList = element.childList.concat();
                this.DelTree.index = element.index;
                this.DelTree.value = element.value;
                this.DelTree.line = element.line;
                this.DelTree.lineAllParentType = element.lineAllParentType.concat();
                this.DelTree.parentIndexData = element.parentIndexData.concat();

                LineData.childList.splice(j, 1);
                this.DelNodeAllChild(element);
                
                this.IsDelChildNode = true;
                //console.log("element:", element)
                return;
            }
        }
        console.log("删除完剩余节点:",this.AllData);
        return LineData;
    }

    //获取所用节点
    FindAll() {
        return this.AllData;
       
    }


    //删除一个节点下的所用孩子
    DelNodeAllChild(node: LineTreenData) {
        let count = node.childList.length;
        if (count <= 0) {
            for (let index = this.AllData.length - 1; index >= 0; index--) {
                const element = this.AllData[index];
                if (node.index == element.index) {
                    this.AllData.splice(index, 1);
                    return;
                }
            }
        }
        for (let index = 0; index < count; index++) {
            const element = node.childList[index];
            this.DelNodeAllChild(element);
        }
        for (let index = this.AllData.length - 1; index >= 0; index--) {
            const element = this.AllData[index];
            if (node.index == element.index) {
                this.AllData.splice(index, 1);
                cc.log("**********删除完成************");
                cc.log(this.AllData);
                return;
            }
        }   
        
       
    }

    /* 还原删除第一个元素的数据 */
    restoreFirstNodeData(state: boolean) {
        if (!state) {
            if (this.IsDelFirstNode) {
                this.IsDelFirstNode = false;
                this.AllData = this.temporaryList.slice();
                this.temporaryList = [];
            }

        } else {
            if (this.IsDelFirstNode) {
                this._data = null;
                this.AllData = [];
                this.IsDelFirstNode = false;
                this.temporaryList = [];
            }
        }

    }

    AddOneNodeAllChild(node: LineTreenData) {
        let count = node.childList.length;
        if (count > 0) {
            for (let index = 0; index < count; index++) {
                const element = node.childList[index];

                let parentList = new Array<number>();

                let lineAllParentType = new Array<number>();

                for (let index = 0; index < node.parentIndexData.length; index++) {
                    const element = node.parentIndexData[index];
                    parentList.push(element);
                }

                for (let index = 0; index <  node.lineAllParentType.length; index++) {
                    const nowNodeType = node.lineAllParentType[index];
                    lineAllParentType.push(nowNodeType);
                    
                }

                lineAllParentType.push(element.lineAllParentType[element.lineAllParentType.length-1]);
                parentList.push(element.index);

                element.lineAllParentType = lineAllParentType;
                element.parentIndexData = parentList;

                this.AllData.push(element);
                this.AddOneNodeAllChild(element);
            }
        }

    }

    /* 
    删除孩子节点
    true 删除成功
    false 删除失败
    */
    ChildNodeDelState(state: boolean) {
        if (state) {
            this.IsDelChildNode = false;
            this.DelTree = null;

        }
    }




















}
