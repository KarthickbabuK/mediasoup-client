import { EnhancedEventEmitter } from './EnhancedEventEmitter';
import { SctpStreamParameters } from './SctpParameters';
import { AppData } from './types';
export type DataProducerOptions<DataProducerAppData extends AppData = AppData> = {
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    label?: string;
    protocol?: string;
    appData?: DataProducerAppData;
};
export type DataProducerEvents = {
    transportclose: [];
    open: [];
    error: [Error];
    close: [];
    bufferedamountlow: [];
    '@close': [];
};
export type DataProducerObserverEvents = {
    close: [];
};
export declare class DataProducer<DataProducerAppData extends AppData = AppData> extends EnhancedEventEmitter<DataProducerEvents> {
    private readonly _id;
    private readonly _dataChannel;
    private _closed;
    private readonly _sctpStreamParameters;
    private _appData;
    protected readonly _observer: EnhancedEventEmitter<DataProducerObserverEvents>;
    constructor({ id, dataChannel, sctpStreamParameters, appData }: {
        id: string;
        dataChannel: RTCDataChannel;
        sctpStreamParameters: SctpStreamParameters;
        appData?: DataProducerAppData;
    });
    /**
     * DataProducer id.
     */
    get id(): string;
    /**
     * Whether the DataProducer is closed.
     */
    get closed(): boolean;
    /**
     * SCTP stream parameters.
     */
    get sctpStreamParameters(): SctpStreamParameters;
    /**
     * DataChannel readyState.
     */
    get readyState(): RTCDataChannelState;
    /**
     * DataChannel label.
     */
    get label(): string;
    /**
     * DataChannel protocol.
     */
    get protocol(): string;
    /**
     * DataChannel bufferedAmount.
     */
    get bufferedAmount(): number;
    /**
     * DataChannel bufferedAmountLowThreshold.
     */
    get bufferedAmountLowThreshold(): number;
    /**
     * Set DataChannel bufferedAmountLowThreshold.
     */
    set bufferedAmountLowThreshold(bufferedAmountLowThreshold: number);
    /**
     * App custom data.
     */
    get appData(): DataProducerAppData;
    /**
     * App custom data setter.
     */
    set appData(appData: DataProducerAppData);
    get observer(): EnhancedEventEmitter;
    /**
     * Closes the DataProducer.
     */
    close(): void;
    /**
     * Transport was closed.
     */
    transportClosed(): void;
    /**
     * Send a message.
     *
     * @param {String|Blob|ArrayBuffer|ArrayBufferView} data.
     */
    send(data: any): void;
    private handleDataChannel;
}
//# sourceMappingURL=DataProducer.d.ts.map