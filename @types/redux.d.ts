import * as Redux from 'redux';
import { Persistor } from 'redux-persist/es/types';
import { Task } from 'redux-saga';

declare module 'redux' {
  export interface Store {
    sagaTask: Task;
    __persistor: Persistor;
  }
}
