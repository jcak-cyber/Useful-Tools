declare namespace Tools {
  interface MessageBody {
    action: string;
    data: {
      key: string;
      value: boolean;
      [key: string]: ?any;
    };
  }

  interface ToolsData {
    rest?: boolean;
  }
}
