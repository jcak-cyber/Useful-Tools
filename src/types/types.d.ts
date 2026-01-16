declare namespace Tools {
  /** 消息动作类型 */
  type MessageAction = "TO_CONTENT_SCRIPT" | "popupOpened";

  /** 消息数据键类型 */
  type MessageDataKey = "rest";

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
    [key: string]: any;
  }
}
