declare namespace Tools {
  /** 消息动作类型 */
  type MessageAction = "TO_CONTENT_SCRIPT" | "popupOpened" | "CAPTURE_SCREENSHOT";

  /** 消息数据键类型 */
  type MessageDataKey = "rest" | "calculator" | "colorPicker";

  /** 消息体接口 */
  interface MessageBody {
    action: MessageAction;
    data: {
      key: MessageDataKey;
      value: boolean;
      [key: string]: any;
    };
  }

  /** 工具数据接口 */
  interface ToolsData {
    rest?: boolean;
    calculator?: boolean;
    colorPicker?: boolean;
    [key: string]: any;
  }
}
