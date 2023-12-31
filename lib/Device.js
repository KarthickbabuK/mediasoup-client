"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = exports.detectDevice = void 0;
const ua_parser_js_1 = require("ua-parser-js");
const Logger_1 = require("./Logger");
const EnhancedEventEmitter_1 = require("./EnhancedEventEmitter");
const errors_1 = require("./errors");
const utils = __importStar(require("./utils"));
const ortc = __importStar(require("./ortc"));
const Transport_1 = require("./Transport");
const Chrome111_1 = require("./handlers/Chrome111");
const Chrome74_1 = require("./handlers/Chrome74");
const Chrome70_1 = require("./handlers/Chrome70");
const Chrome67_1 = require("./handlers/Chrome67");
const Chrome55_1 = require("./handlers/Chrome55");
const Firefox60_1 = require("./handlers/Firefox60");
const Safari12_1 = require("./handlers/Safari12");
const Safari11_1 = require("./handlers/Safari11");
const Edge11_1 = require("./handlers/Edge11");
const ReactNativeUnifiedPlan_1 = require("./handlers/ReactNativeUnifiedPlan");
const ReactNative_1 = require("./handlers/ReactNative");
const logger = new Logger_1.Logger('Device');
function detectDevice() {
    // React-Native.
    // NOTE: react-native-webrtc >= 1.75.0 is required.
    // NOTE: react-native-webrtc with Unified Plan requires version >= 106.0.0.
    if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
        logger.debug('detectDevice() | React-Native detected');
        if (typeof RTCPeerConnection === 'undefined') {
            logger.warn('detectDevice() | unsupported react-native-webrtc without RTCPeerConnection, forgot to call registerGlobals()?');
            return undefined;
        }
        if (typeof RTCRtpTransceiver !== 'undefined') {
            logger.debug('detectDevice() | ReactNative UnifiedPlan handler chosen');
            return 'ReactNativeUnifiedPlan';
        }
        else {
            logger.debug('detectDevice() | ReactNative PlanB handler chosen');
            return 'ReactNative';
        }
    }
    // Browser.
    else if (typeof navigator === 'object' && typeof navigator.userAgent === 'string') {
        const ua = navigator.userAgent;
        const uaParser = new ua_parser_js_1.UAParser(ua);
        logger.debug('detectDevice() | browser detected [ua:%s, parsed:%o]', ua, uaParser.getResult());
        const browser = uaParser.getBrowser();
        const browserName = browser.name?.toLowerCase() ?? '';
        const browserVersion = parseInt(browser.major ?? '0');
        const engine = uaParser.getEngine();
        const engineName = engine.name?.toLowerCase() ?? '';
        const os = uaParser.getOS();
        const osName = os.name?.toLowerCase() ?? '';
        const osVersion = parseFloat(os.version ?? '0');
        const device = uaParser.getDevice();
		const deviceModel = device.model?.toLowerCase() ?? '';
        const isIOS = osName === 'ios' || deviceModel === 'ipad';
        const isChrome = [
            'chrome',
            'chromium',
            'mobile chrome',
            'chrome webview',
            'chrome headless'
        ].includes(browserName);
        const isFirefox = [
            'firefox',
            'mobile firefox',
            'mobile focus'
        ].includes(browserName);
        const isSafari = [
            'safari',
            'mobile safari'
        ].includes(browserName);
        const isEdge = ['edge'].includes(browserName);
        // Chrome, Chromium, and Edge.
        if ((isChrome || isEdge) && !isIOS && browserVersion >= 111) {
            return 'Chrome111';
        }
        else if ((isChrome && !isIOS && browserVersion >= 74) ||
            (isEdge && !isIOS && browserVersion >= 88)) {
            return 'Chrome74';
        }
        else if (isChrome && !isIOS && browserVersion >= 70) {
            return 'Chrome70';
        }
        else if (isChrome && !isIOS && browserVersion >= 67) {
            return 'Chrome67';
        }
        else if (isChrome && !isIOS && browserVersion >= 55) {
            return 'Chrome55';
        }
        // Firefox.
        else if (isFirefox && !isIOS && browserVersion >= 60) {
            return 'Firefox60';
        }
        // Firefox on iOS (so Safari).
        else if (isFirefox && isIOS && osVersion >= 14.3) {
            return 'Safari12';
        }
        // Safari with Unified-Plan support enabled.
        else if (isSafari &&
            browserVersion >= 12 &&
            typeof RTCRtpTransceiver !== 'undefined' &&
            RTCRtpTransceiver.prototype.hasOwnProperty('currentDirection')) {
            return 'Safari12';
        }
        // Safari with Plab-B support.
        else if (isSafari && browserVersion >= 11) {
            return 'Safari11';
        }
        // Old Edge with ORTC support.
        else if (isEdge && !isIOS && browserVersion >= 11 && browserVersion <= 18) {
            return 'Edge11';
        }
        // Best effort for WebKit based browsers in iOS.
        else if (engineName === 'webkit' &&
            isIOS &&
            // osVersion >= 14.3 &&
            typeof RTCRtpTransceiver !== 'undefined' &&
            RTCRtpTransceiver.prototype.hasOwnProperty('currentDirection')) {
            return 'Safari12';
        }
        // Best effort for Chromium based browsers.
        else if (engineName === 'blink') {
            const match = ua.match(/(?:(?:Chrome|Chromium))[ /](\w+)/i);
            if (match) {
                const version = Number(match[1]);
                if (version >= 111) {
                    return 'Chrome111';
                }
                else if (version >= 74) {
                    return 'Chrome74';
                }
                else if (version >= 70) {
                    return 'Chrome70';
                }
                else if (version >= 67) {
                    return 'Chrome67';
                }
                else {
                    return 'Chrome55';
                }
            }
            else {
                return 'Chrome111';
            }
        }
        // Unsupported browser.
        else {
            logger.warn('detectDevice() | browser not supported [name:%s, version:%s]', browserName, browserVersion);
            return undefined;
        }
    }
    // Unknown device.
    else {
        logger.warn('detectDevice() | unknown device');
        return undefined;
    }
}
exports.detectDevice = detectDevice;
class Device {
    /**
     * Create a new Device to connect to mediasoup server.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    constructor({ handlerName, handlerFactory, Handler } = {}) {
        // Loaded flag.
        this._loaded = false;
        // Observer instance.
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug('constructor()');
        // Handle deprecated option.
        if (Handler) {
            logger.warn('constructor() | Handler option is DEPRECATED, use handlerName or handlerFactory instead');
            if (typeof Handler === 'string') {
                handlerName = Handler;
            }
            else {
                throw new TypeError('non string Handler option no longer supported, use handlerFactory instead');
            }
        }
        if (handlerName && handlerFactory) {
            throw new TypeError('just one of handlerName or handlerInterface can be given');
        }
        if (handlerFactory) {
            this._handlerFactory = handlerFactory;
        }
        else {
            if (handlerName) {
                logger.debug('constructor() | handler given: %s', handlerName);
            }
            else {
                handlerName = detectDevice();
                if (handlerName) {
                    logger.debug('constructor() | detected handler: %s', handlerName);
                }
                else {
                    throw new errors_1.UnsupportedError('device not supported');
                }
            }
            switch (handlerName) {
                case 'Chrome111':
                    this._handlerFactory = Chrome111_1.Chrome111.createFactory();
                    break;
                case 'Chrome74':
                    this._handlerFactory = Chrome74_1.Chrome74.createFactory();
                    break;
                case 'Chrome70':
                    this._handlerFactory = Chrome70_1.Chrome70.createFactory();
                    break;
                case 'Chrome67':
                    this._handlerFactory = Chrome67_1.Chrome67.createFactory();
                    break;
                case 'Chrome55':
                    this._handlerFactory = Chrome55_1.Chrome55.createFactory();
                    break;
                case 'Firefox60':
                    this._handlerFactory = Firefox60_1.Firefox60.createFactory();
                    break;
                case 'Safari12':
                    this._handlerFactory = Safari12_1.Safari12.createFactory();
                    break;
                case 'Safari11':
                    this._handlerFactory = Safari11_1.Safari11.createFactory();
                    break;
                case 'Edge11':
                    this._handlerFactory = Edge11_1.Edge11.createFactory();
                    break;
                case 'ReactNativeUnifiedPlan':
                    this._handlerFactory = ReactNativeUnifiedPlan_1.ReactNativeUnifiedPlan.createFactory();
                    break;
                case 'ReactNative':
                    this._handlerFactory = ReactNative_1.ReactNative.createFactory();
                    break;
                default:
                    throw new TypeError(`unknown handlerName "${handlerName}"`);
            }
        }
        // Create a temporal handler to get its name.
        const handler = this._handlerFactory();
        this._handlerName = handler.name;
        handler.close();
        this._extendedRtpCapabilities = undefined;
        this._recvRtpCapabilities = undefined;
        this._canProduceByKind =
            {
                audio: false,
                video: false
            };
        this._sctpCapabilities = undefined;
    }
    /**
     * The RTC handler name.
     */
    get handlerName() {
        return this._handlerName;
    }
    /**
     * Whether the Device is loaded.
     */
    get loaded() {
        return this._loaded;
    }
    /**
     * RTP capabilities of the Device for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get rtpCapabilities() {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        return this._recvRtpCapabilities;
    }
    /**
     * SCTP capabilities of the Device.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get sctpCapabilities() {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        return this._sctpCapabilities;
    }
    get observer() {
        return this._observer;
    }
    /**
     * Initialize the Device.
     */
    async load({ routerRtpCapabilities }) {
        logger.debug('load() [routerRtpCapabilities:%o]', routerRtpCapabilities);
        routerRtpCapabilities = utils.clone(routerRtpCapabilities, undefined);
        // Temporal handler to get its capabilities.
        let handler;
        try {
            if (this._loaded) {
                throw new errors_1.InvalidStateError('already loaded');
            }
            // This may throw.
            ortc.validateRtpCapabilities(routerRtpCapabilities);
            handler = this._handlerFactory();
            const nativeRtpCapabilities = await handler.getNativeRtpCapabilities();
            logger.debug('load() | got native RTP capabilities:%o', nativeRtpCapabilities);
            // This may throw.
            ortc.validateRtpCapabilities(nativeRtpCapabilities);
            // Get extended RTP capabilities.
            this._extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, routerRtpCapabilities);
            logger.debug('load() | got extended RTP capabilities:%o', this._extendedRtpCapabilities);
            // Check whether we can produce audio/video.
            this._canProduceByKind.audio =
                ortc.canSend('audio', this._extendedRtpCapabilities);
            this._canProduceByKind.video =
                ortc.canSend('video', this._extendedRtpCapabilities);
            // Generate our receiving RTP capabilities for receiving media.
            this._recvRtpCapabilities =
                ortc.getRecvRtpCapabilities(this._extendedRtpCapabilities);
            // This may throw.
            ortc.validateRtpCapabilities(this._recvRtpCapabilities);
            logger.debug('load() | got receiving RTP capabilities:%o', this._recvRtpCapabilities);
            // Generate our SCTP capabilities.
            this._sctpCapabilities = await handler.getNativeSctpCapabilities();
            logger.debug('load() | got native SCTP capabilities:%o', this._sctpCapabilities);
            // This may throw.
            ortc.validateSctpCapabilities(this._sctpCapabilities);
            logger.debug('load() succeeded');
            this._loaded = true;
            handler.close();
        }
        catch (error) {
            if (handler) {
                handler.close();
            }
            throw error;
        }
    }
    /**
     * Whether we can produce audio/video.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    canProduce(kind) {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        else if (kind !== 'audio' && kind !== 'video') {
            throw new TypeError(`invalid kind "${kind}"`);
        }
        return this._canProduceByKind[kind];
    }
    /**
     * Creates a Transport for sending media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createSendTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        logger.debug('createSendTransport()');
        return this.createTransport({
            direction: 'send',
            id: id,
            iceParameters: iceParameters,
            iceCandidates: iceCandidates,
            dtlsParameters: dtlsParameters,
            sctpParameters: sctpParameters,
            iceServers: iceServers,
            iceTransportPolicy: iceTransportPolicy,
            additionalSettings: additionalSettings,
            proprietaryConstraints: proprietaryConstraints,
            appData: appData
        });
    }
    /**
     * Creates a Transport for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createRecvTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        logger.debug('createRecvTransport()');
        return this.createTransport({
            direction: 'recv',
            id: id,
            iceParameters: iceParameters,
            iceCandidates: iceCandidates,
            dtlsParameters: dtlsParameters,
            sctpParameters: sctpParameters,
            iceServers: iceServers,
            iceTransportPolicy: iceTransportPolicy,
            additionalSettings: additionalSettings,
            proprietaryConstraints: proprietaryConstraints,
            appData: appData
        });
    }
    createTransport({ direction, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        else if (typeof id !== 'string') {
            throw new TypeError('missing id');
        }
        else if (typeof iceParameters !== 'object') {
            throw new TypeError('missing iceParameters');
        }
        else if (!Array.isArray(iceCandidates)) {
            throw new TypeError('missing iceCandidates');
        }
        else if (typeof dtlsParameters !== 'object') {
            throw new TypeError('missing dtlsParameters');
        }
        else if (sctpParameters && typeof sctpParameters !== 'object') {
            throw new TypeError('wrong sctpParameters');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Create a new Transport.
        const transport = new Transport_1.Transport({
            direction,
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers,
            iceTransportPolicy,
            additionalSettings,
            proprietaryConstraints,
            appData,
            handlerFactory: this._handlerFactory,
            extendedRtpCapabilities: this._extendedRtpCapabilities,
            canProduceByKind: this._canProduceByKind
        });
        // Emit observer event.
        this._observer.safeEmit('newtransport', transport);
        return transport;
    }
}
exports.Device = Device;
