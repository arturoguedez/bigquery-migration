export interface ILoggerConfig {
  level: string;
}

export interface IGoogleConfig {
  bigQuery: {
    projectId: string,
    dataSet: string
  };
}
