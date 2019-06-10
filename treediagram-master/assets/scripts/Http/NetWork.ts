import { ConstValue } from "../Data/ConstValue";
import { UIManager } from "../Manager/UIManager";
import ErrorPanel from "../UI/panel/ErrorPanel";
import { UIHelp } from '../Utils/UIHelp';
import SubmissionPanel from '../UI/panel/SubmissionPanel';
export class NetWork {
    private static instance: NetWork;

    public static readonly isOnlineEnv = /\/\/static\.haibian\.com/.test(window['location'].href);
    public static readonly isProtocol = /http:/.test(window['location'].protocol);
    public static readonly isLocal = /localhost/.test(window['location'].href) || NetWork.isProtocol;
    public static readonly BASE = NetWork.isOnlineEnv ? '//courseware.haibian.com' : NetWork.isLocal ? '//ceshi.courseware.haibian.com' : '//ceshi_courseware.haibian.com';


    public static readonly GET_QUESTION = NetWork.BASE + '/get';
    public static readonly GET_USER_PROGRESS = NetWork.BASE + '/get/answer';
    public static readonly GET_TITLE = NetWork.BASE + "/get/title";
    public static readonly ADD = NetWork.BASE + "/add";
    public static readonly MODIFY = NetWork.BASE + "/modify";
    public static readonly CLEAR = NetWork.BASE + "/clear";

    public static courseware_id = null;
    public static title_id = null;
    public static user_id = null;

    public static empty: boolean = false;//清理脏数据的开关，在URL里面拼此参数 = true；

    static getInstance() {
        if (this.instance == null) {
            this.instance = new NetWork();
        }
        return this.instance;
    }

    /**
     * 请求网络Post 0成功 1超时
     * @param url 
     * @param openType 
     * @param contentType 
     * @param callback 
     * @param params 
     */
    httpRequest(url, openType, contentType, callback = null, params = "") {
        if (ConstValue.IS_TEACHER && !NetWork.title_id) {//教师端没有titleId的情况
            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                    "URL参数错误,请联系技术人员！",
                    "", "", "确定");
            });
            return;
        } else if (!ConstValue.IS_TEACHER && (!NetWork.courseware_id || !NetWork.user_id)) {//学生端没有userid或coursewareId的情况
            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                    "异常编号为001,请联系客服！",
                    "", "", "确定");
            });
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(openType, url);
        xhr.timeout = 10000;
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.withCredentials = true;

        //回调
        xhr.onreadystatechange = function () {
            console.log("httpRequest rsp status", xhr.status, "        xhr.readyState", xhr.readyState, "        xhr.responseText", xhr.responseText);
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 400)) {
                let response = JSON.parse(xhr.responseText);
                if (callback && response.errcode == 0) {
                    callback(false, response);
                } else {
                    if (ConstValue.IS_EDITIONS) {
                        UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                            (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(response.errmsg + ",请联系客服！", "", "", "确定", () => {
                                NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                            }, false);
                        });
                    }
                }
            }
        };

        //超时回调
        xhr.ontimeout = function (event) {
            if (ConstValue.IS_EDITIONS) {
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("网络不佳，请稍后重试", "", "若重新连接无效，请联系客服", "重新连接", () => {
                        NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                    }, true);
                });
            }
            console.log('httpRequest timeout');
            callback && callback(true, null);
        };

        //出错
        xhr.onerror = function (error) {
            if (ConstValue.IS_EDITIONS) {
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("网络出错，请稍后重试", "若重新连接无效，请联系客服", "", "重新连接", () => {
                        NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                    }, true);
                });
            }
            console.log('httpRequest error');
            callback && callback(true, null);
        }

        xhr.send(params);
    }

    /**
     * 获取url参数
     */
    GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        NetWork.courseware_id = theRequest["id"];
        NetWork.title_id = theRequest["title_id"];
        NetWork.user_id = theRequest["user_id"];
        NetWork.empty = theRequest["empty"];

        // LogWrap.log(typeof(theRequest["empty"]), "   ", NetWork.empty);
        if (ConstValue.IS_EDITIONS) {
            var img = new Image();
            img.src = (NetWork.isOnlineEnv ? 'https://logserver.haibian.com/statistical/?type=7&' : 'https://ceshi-statistical.haibian.com/?type=7&') +
                'course_id=' + theRequest["id"] +
                "&chapter_id=" + theRequest["chapter_id"] +
                "&user_id=" + theRequest["user_id"] +
                "&subject=" + theRequest["subject"] +
                "&event=" + "CoursewareLogEvent" +
                "&identity=1" +
                "&extra=" + JSON.stringify({ url: location, CoursewareKey: ConstValue.CoursewareKey, empty: theRequest["empty"] });
        }
    }

    
     //提交或者修改答案
     DetectionNet(data,callback:Function) {
        if (!NetWork.title_id) {
            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("titleId为空,请联系技术老师解决！\ntitleId=" + NetWork.title_id, "", "", "确定");
            });
            return;
        }
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.title_id, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                if (response.data.courseware_content == null || response.data.courseware_content == "") {
                    console.log(111);
                    this.AddNet(data);
                } else {
                    NetWork.courseware_id = response.data.courseware_id;
                    let res = JSON.parse(response.data.courseware_content)
                    if (!NetWork.empty) {
                        if (res.CoursewareKey == ConstValue.CoursewareKey) {
                            this.ModifyNet(data);
                        } else {
                            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("该titleId已被使用,请联系技术老师解决！\ntitleId=" + NetWork.title_id, "", "", "确定");
                            });
                        }
                    }
                }
            }
        }.bind(this), null);
    }


    DetectionNetTeacher(callFunc:Function){
        if (!NetWork.title_id) {
            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("titleId为空,请联系技术老师解决！\ntitleId=" + NetWork.title_id, "", "", "确定");
            });
            return;
        }
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.title_id, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                if (response.data.courseware_content == null || response.data.courseware_content == "") {
                  
                }else{
                    if (!NetWork.empty) {
                        let res = JSON.parse(response.data.courseware_content)
                        if (res.CoursewareKey == ConstValue.CoursewareKey) {
                            callFunc(response);
                        } else {
                            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("该titleId已被使用,请联系技术老师解决！\ntitleId=" + NetWork.title_id, "", "", "确定");
                            });
                        }
                    }
                } 
            }
        }.bind(this), null);
    }

    //添加答案信息
    AddNet(gameDataJson) {
        let data = { title_id: NetWork.title_id, courseware_content: gameDataJson, is_result: 1, is_lavel: 0};
        let dataJson = JSON.stringify(data);
        NetWork.getInstance().httpRequest(NetWork.ADD, "POST", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                UIHelp.showTip("答案提交成功");
            }
        }.bind(this), dataJson);
    }

    

    //修改课件
    ModifyNet(gameDataJson) {
        let jsonData = { courseware_id: NetWork.courseware_id, courseware_content: gameDataJson ,is_result: 1, is_lavel: 0};
        NetWork.getInstance().httpRequest(NetWork.MODIFY, "POST", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                UIHelp.showTip("答案修改成功");
            }
        }.bind(this), JSON.stringify(jsonData));
    }

    GetNet(callback) {
        if (!NetWork.courseware_id) {
            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("titleId为空,请联系技术老师解决！\ntitleId=" + NetWork.title_id, "", "", "确定");
            });
            return;
        }
        this.httpRequest(NetWork.GET_QUESTION + "?courseware_id=" + NetWork.courseware_id, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                //response = JSON.parse(response);
                if (response.data == null ) {
                    UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                        (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("数据加载失败\ncourseware_id=" + NetWork.courseware_id, "", "", "确定");
                    });
                    return;
                }

                let res = JSON.parse(response.data.courseware_content)
                if (res.CoursewareKey == ConstValue.CoursewareKey) {
                    callback(response);
                    return;
                }else{
                    UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                        (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("id被占用,请联系技术老师解决！\ncourseware_id=" + NetWork.courseware_id, "", "", "确定");
                    });
                    return;
                } 
                
            };
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