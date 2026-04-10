import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace router. */
export namespace router {

    /** Namespace manager. */
    namespace manager {

        /** Represents a RouterManager */
        class RouterManager extends $protobuf.rpc.Service {

            /**
             * Constructs a new RouterManager service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new RouterManager service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): RouterManager;

            /**
             * Calls GetInfo.
             * @param request Empty message or plain object
             * @param callback Node-style callback called with the error, if any, and RouterInfo
             */
            public getInfo(request: google.protobuf.IEmpty, callback: router.manager.RouterManager.GetInfoCallback): void;

            /**
             * Calls GetInfo.
             * @param request Empty message or plain object
             * @returns Promise
             */
            public getInfo(request: google.protobuf.IEmpty): Promise<router.manager.RouterInfo>;

            /**
             * Calls Configure.
             * @param request ConfigureRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and RouterInfo
             */
            public configure(request: router.manager.IConfigureRequest, callback: router.manager.RouterManager.ConfigureCallback): void;

            /**
             * Calls Configure.
             * @param request ConfigureRequest message or plain object
             * @returns Promise
             */
            public configure(request: router.manager.IConfigureRequest): Promise<router.manager.RouterInfo>;

            /**
             * Calls UpsertPeer.
             * @param request UpsertPeerRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Empty
             */
            public upsertPeer(request: router.manager.IUpsertPeerRequest, callback: router.manager.RouterManager.UpsertPeerCallback): void;

            /**
             * Calls UpsertPeer.
             * @param request UpsertPeerRequest message or plain object
             * @returns Promise
             */
            public upsertPeer(request: router.manager.IUpsertPeerRequest): Promise<google.protobuf.Empty>;

            /**
             * Calls DeletePeer.
             * @param request DeletePeerRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Empty
             */
            public deletePeer(request: router.manager.IDeletePeerRequest, callback: router.manager.RouterManager.DeletePeerCallback): void;

            /**
             * Calls DeletePeer.
             * @param request DeletePeerRequest message or plain object
             * @returns Promise
             */
            public deletePeer(request: router.manager.IDeletePeerRequest): Promise<google.protobuf.Empty>;

            /**
             * Calls ListPeers.
             * @param request Empty message or plain object
             * @param callback Node-style callback called with the error, if any, and ListPeersResponse
             */
            public listPeers(request: google.protobuf.IEmpty, callback: router.manager.RouterManager.ListPeersCallback): void;

            /**
             * Calls ListPeers.
             * @param request Empty message or plain object
             * @returns Promise
             */
            public listPeers(request: google.protobuf.IEmpty): Promise<router.manager.ListPeersResponse>;

            /**
             * Calls WatchEvents.
             * @param request WatchEventsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Event
             */
            public watchEvents(request: router.manager.IWatchEventsRequest, callback: router.manager.RouterManager.WatchEventsCallback): void;

            /**
             * Calls WatchEvents.
             * @param request WatchEventsRequest message or plain object
             * @returns Promise
             */
            public watchEvents(request: router.manager.IWatchEventsRequest): Promise<router.manager.Event>;
        }

        namespace RouterManager {

            /**
             * Callback as used by {@link router.manager.RouterManager#getInfo}.
             * @param error Error, if any
             * @param [response] RouterInfo
             */
            type GetInfoCallback = (error: (Error|null), response?: router.manager.RouterInfo) => void;

            /**
             * Callback as used by {@link router.manager.RouterManager#configure}.
             * @param error Error, if any
             * @param [response] RouterInfo
             */
            type ConfigureCallback = (error: (Error|null), response?: router.manager.RouterInfo) => void;

            /**
             * Callback as used by {@link router.manager.RouterManager#upsertPeer}.
             * @param error Error, if any
             * @param [response] Empty
             */
            type UpsertPeerCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

            /**
             * Callback as used by {@link router.manager.RouterManager#deletePeer}.
             * @param error Error, if any
             * @param [response] Empty
             */
            type DeletePeerCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

            /**
             * Callback as used by {@link router.manager.RouterManager#listPeers}.
             * @param error Error, if any
             * @param [response] ListPeersResponse
             */
            type ListPeersCallback = (error: (Error|null), response?: router.manager.ListPeersResponse) => void;

            /**
             * Callback as used by {@link router.manager.RouterManager#watchEvents}.
             * @param error Error, if any
             * @param [response] Event
             */
            type WatchEventsCallback = (error: (Error|null), response?: router.manager.Event) => void;
        }

        /** Properties of a ConfigureRequest. */
        interface IConfigureRequest {

            /** ConfigureRequest config */
            config?: (router.manager.INetworkConfig|null);

            /** ConfigureRequest wireguard */
            wireguard?: (router.manager.IWireGuardGlobalConfig|null);
        }

        /** Represents a ConfigureRequest. */
        class ConfigureRequest implements IConfigureRequest {

            /**
             * Constructs a new ConfigureRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IConfigureRequest);

            /** ConfigureRequest config. */
            public config?: (router.manager.INetworkConfig|null);

            /** ConfigureRequest wireguard. */
            public wireguard?: (router.manager.IWireGuardGlobalConfig|null);

            /** ConfigureRequest protocolConfig. */
            public protocolConfig?: "wireguard";

            /**
             * Creates a new ConfigureRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConfigureRequest instance
             */
            public static create(properties?: router.manager.IConfigureRequest): router.manager.ConfigureRequest;

            /**
             * Encodes the specified ConfigureRequest message. Does not implicitly {@link router.manager.ConfigureRequest.verify|verify} messages.
             * @param message ConfigureRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IConfigureRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConfigureRequest message, length delimited. Does not implicitly {@link router.manager.ConfigureRequest.verify|verify} messages.
             * @param message ConfigureRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IConfigureRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConfigureRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConfigureRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.ConfigureRequest;

            /**
             * Decodes a ConfigureRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConfigureRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.ConfigureRequest;

            /**
             * Verifies a ConfigureRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConfigureRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConfigureRequest
             */
            public static fromObject(object: { [k: string]: any }): router.manager.ConfigureRequest;

            /**
             * Creates a plain object from a ConfigureRequest message. Also converts values to other types if specified.
             * @param message ConfigureRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.ConfigureRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConfigureRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ConfigureRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpsertPeerRequest. */
        interface IUpsertPeerRequest {

            /** UpsertPeerRequest peer */
            peer?: (router.manager.IPeer|null);
        }

        /** Represents an UpsertPeerRequest. */
        class UpsertPeerRequest implements IUpsertPeerRequest {

            /**
             * Constructs a new UpsertPeerRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IUpsertPeerRequest);

            /** UpsertPeerRequest peer. */
            public peer?: (router.manager.IPeer|null);

            /**
             * Creates a new UpsertPeerRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpsertPeerRequest instance
             */
            public static create(properties?: router.manager.IUpsertPeerRequest): router.manager.UpsertPeerRequest;

            /**
             * Encodes the specified UpsertPeerRequest message. Does not implicitly {@link router.manager.UpsertPeerRequest.verify|verify} messages.
             * @param message UpsertPeerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IUpsertPeerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpsertPeerRequest message, length delimited. Does not implicitly {@link router.manager.UpsertPeerRequest.verify|verify} messages.
             * @param message UpsertPeerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IUpsertPeerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpsertPeerRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpsertPeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.UpsertPeerRequest;

            /**
             * Decodes an UpsertPeerRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpsertPeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.UpsertPeerRequest;

            /**
             * Verifies an UpsertPeerRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpsertPeerRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpsertPeerRequest
             */
            public static fromObject(object: { [k: string]: any }): router.manager.UpsertPeerRequest;

            /**
             * Creates a plain object from an UpsertPeerRequest message. Also converts values to other types if specified.
             * @param message UpsertPeerRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.UpsertPeerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpsertPeerRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpsertPeerRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeletePeerRequest. */
        interface IDeletePeerRequest {

            /** DeletePeerRequest id */
            id?: (string|null);
        }

        /** Represents a DeletePeerRequest. */
        class DeletePeerRequest implements IDeletePeerRequest {

            /**
             * Constructs a new DeletePeerRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IDeletePeerRequest);

            /** DeletePeerRequest id. */
            public id: string;

            /**
             * Creates a new DeletePeerRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeletePeerRequest instance
             */
            public static create(properties?: router.manager.IDeletePeerRequest): router.manager.DeletePeerRequest;

            /**
             * Encodes the specified DeletePeerRequest message. Does not implicitly {@link router.manager.DeletePeerRequest.verify|verify} messages.
             * @param message DeletePeerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IDeletePeerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeletePeerRequest message, length delimited. Does not implicitly {@link router.manager.DeletePeerRequest.verify|verify} messages.
             * @param message DeletePeerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IDeletePeerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeletePeerRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeletePeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.DeletePeerRequest;

            /**
             * Decodes a DeletePeerRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeletePeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.DeletePeerRequest;

            /**
             * Verifies a DeletePeerRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeletePeerRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeletePeerRequest
             */
            public static fromObject(object: { [k: string]: any }): router.manager.DeletePeerRequest;

            /**
             * Creates a plain object from a DeletePeerRequest message. Also converts values to other types if specified.
             * @param message DeletePeerRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.DeletePeerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeletePeerRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeletePeerRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListPeersResponse. */
        interface IListPeersResponse {

            /** ListPeersResponse peers */
            peers?: (router.manager.IPeer[]|null);
        }

        /** Represents a ListPeersResponse. */
        class ListPeersResponse implements IListPeersResponse {

            /**
             * Constructs a new ListPeersResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IListPeersResponse);

            /** ListPeersResponse peers. */
            public peers: router.manager.IPeer[];

            /**
             * Creates a new ListPeersResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListPeersResponse instance
             */
            public static create(properties?: router.manager.IListPeersResponse): router.manager.ListPeersResponse;

            /**
             * Encodes the specified ListPeersResponse message. Does not implicitly {@link router.manager.ListPeersResponse.verify|verify} messages.
             * @param message ListPeersResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IListPeersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListPeersResponse message, length delimited. Does not implicitly {@link router.manager.ListPeersResponse.verify|verify} messages.
             * @param message ListPeersResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IListPeersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListPeersResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListPeersResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.ListPeersResponse;

            /**
             * Decodes a ListPeersResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListPeersResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.ListPeersResponse;

            /**
             * Verifies a ListPeersResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListPeersResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListPeersResponse
             */
            public static fromObject(object: { [k: string]: any }): router.manager.ListPeersResponse;

            /**
             * Creates a plain object from a ListPeersResponse message. Also converts values to other types if specified.
             * @param message ListPeersResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.ListPeersResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListPeersResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListPeersResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WatchEventsRequest. */
        interface IWatchEventsRequest {

            /** WatchEventsRequest peerIds */
            peerIds?: (string[]|null);
        }

        /** Represents a WatchEventsRequest. */
        class WatchEventsRequest implements IWatchEventsRequest {

            /**
             * Constructs a new WatchEventsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IWatchEventsRequest);

            /** WatchEventsRequest peerIds. */
            public peerIds: string[];

            /**
             * Creates a new WatchEventsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WatchEventsRequest instance
             */
            public static create(properties?: router.manager.IWatchEventsRequest): router.manager.WatchEventsRequest;

            /**
             * Encodes the specified WatchEventsRequest message. Does not implicitly {@link router.manager.WatchEventsRequest.verify|verify} messages.
             * @param message WatchEventsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IWatchEventsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WatchEventsRequest message, length delimited. Does not implicitly {@link router.manager.WatchEventsRequest.verify|verify} messages.
             * @param message WatchEventsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IWatchEventsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WatchEventsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WatchEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.WatchEventsRequest;

            /**
             * Decodes a WatchEventsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WatchEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.WatchEventsRequest;

            /**
             * Verifies a WatchEventsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WatchEventsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WatchEventsRequest
             */
            public static fromObject(object: { [k: string]: any }): router.manager.WatchEventsRequest;

            /**
             * Creates a plain object from a WatchEventsRequest message. Also converts values to other types if specified.
             * @param message WatchEventsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.WatchEventsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WatchEventsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WatchEventsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RouterInfo. */
        interface IRouterInfo {

            /** RouterInfo routerId */
            routerId?: (string|null);

            /** RouterInfo version */
            version?: (string|null);

            /** RouterInfo config */
            config?: (router.manager.INetworkConfig|null);

            /** RouterInfo wireguard */
            wireguard?: (router.manager.IWireGuardGlobalState|null);

            /** RouterInfo supportedProtocols */
            supportedProtocols?: (string[]|null);
        }

        /** Represents a RouterInfo. */
        class RouterInfo implements IRouterInfo {

            /**
             * Constructs a new RouterInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IRouterInfo);

            /** RouterInfo routerId. */
            public routerId: string;

            /** RouterInfo version. */
            public version: string;

            /** RouterInfo config. */
            public config?: (router.manager.INetworkConfig|null);

            /** RouterInfo wireguard. */
            public wireguard?: (router.manager.IWireGuardGlobalState|null);

            /** RouterInfo supportedProtocols. */
            public supportedProtocols: string[];

            /** RouterInfo protocolState. */
            public protocolState?: "wireguard";

            /**
             * Creates a new RouterInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RouterInfo instance
             */
            public static create(properties?: router.manager.IRouterInfo): router.manager.RouterInfo;

            /**
             * Encodes the specified RouterInfo message. Does not implicitly {@link router.manager.RouterInfo.verify|verify} messages.
             * @param message RouterInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IRouterInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RouterInfo message, length delimited. Does not implicitly {@link router.manager.RouterInfo.verify|verify} messages.
             * @param message RouterInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IRouterInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RouterInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RouterInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.RouterInfo;

            /**
             * Decodes a RouterInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RouterInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.RouterInfo;

            /**
             * Verifies a RouterInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RouterInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RouterInfo
             */
            public static fromObject(object: { [k: string]: any }): router.manager.RouterInfo;

            /**
             * Creates a plain object from a RouterInfo message. Also converts values to other types if specified.
             * @param message RouterInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.RouterInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RouterInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RouterInfo
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a NetworkConfig. */
        interface INetworkConfig {

            /** NetworkConfig overlayCidr */
            overlayCidr?: (string|null);

            /** NetworkConfig serverAddress */
            serverAddress?: (string|null);

            /** NetworkConfig mtu */
            mtu?: (number|null);

            /** NetworkConfig publicHost */
            publicHost?: (string|null);

            /** NetworkConfig listenPort */
            listenPort?: (number|null);
        }

        /** Represents a NetworkConfig. */
        class NetworkConfig implements INetworkConfig {

            /**
             * Constructs a new NetworkConfig.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.INetworkConfig);

            /** NetworkConfig overlayCidr. */
            public overlayCidr: string;

            /** NetworkConfig serverAddress. */
            public serverAddress: string;

            /** NetworkConfig mtu. */
            public mtu: number;

            /** NetworkConfig publicHost. */
            public publicHost: string;

            /** NetworkConfig listenPort. */
            public listenPort: number;

            /**
             * Creates a new NetworkConfig instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NetworkConfig instance
             */
            public static create(properties?: router.manager.INetworkConfig): router.manager.NetworkConfig;

            /**
             * Encodes the specified NetworkConfig message. Does not implicitly {@link router.manager.NetworkConfig.verify|verify} messages.
             * @param message NetworkConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.INetworkConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NetworkConfig message, length delimited. Does not implicitly {@link router.manager.NetworkConfig.verify|verify} messages.
             * @param message NetworkConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.INetworkConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NetworkConfig message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NetworkConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.NetworkConfig;

            /**
             * Decodes a NetworkConfig message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NetworkConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.NetworkConfig;

            /**
             * Verifies a NetworkConfig message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NetworkConfig message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NetworkConfig
             */
            public static fromObject(object: { [k: string]: any }): router.manager.NetworkConfig;

            /**
             * Creates a plain object from a NetworkConfig message. Also converts values to other types if specified.
             * @param message NetworkConfig
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.NetworkConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NetworkConfig to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for NetworkConfig
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Peer. */
        interface IPeer {

            /** Peer id */
            id?: (string|null);

            /** Peer name */
            name?: (string|null);

            /** Peer internalIps */
            internalIps?: (string[]|null);

            /** Peer wireguard */
            wireguard?: (router.manager.IWireGuardPeerConfig|null);

            /** Peer status */
            status?: (router.manager.IPeerStatus|null);
        }

        /** Represents a Peer. */
        class Peer implements IPeer {

            /**
             * Constructs a new Peer.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IPeer);

            /** Peer id. */
            public id: string;

            /** Peer name. */
            public name: string;

            /** Peer internalIps. */
            public internalIps: string[];

            /** Peer wireguard. */
            public wireguard?: (router.manager.IWireGuardPeerConfig|null);

            /** Peer status. */
            public status?: (router.manager.IPeerStatus|null);

            /** Peer protocolData. */
            public protocolData?: "wireguard";

            /**
             * Creates a new Peer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Peer instance
             */
            public static create(properties?: router.manager.IPeer): router.manager.Peer;

            /**
             * Encodes the specified Peer message. Does not implicitly {@link router.manager.Peer.verify|verify} messages.
             * @param message Peer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Peer message, length delimited. Does not implicitly {@link router.manager.Peer.verify|verify} messages.
             * @param message Peer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Peer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.Peer;

            /**
             * Decodes a Peer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.Peer;

            /**
             * Verifies a Peer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Peer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Peer
             */
            public static fromObject(object: { [k: string]: any }): router.manager.Peer;

            /**
             * Creates a plain object from a Peer message. Also converts values to other types if specified.
             * @param message Peer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.Peer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Peer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Peer
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PeerStatus. */
        interface IPeerStatus {

            /** PeerStatus isActive */
            isActive?: (boolean|null);

            /** PeerStatus lastEndpoint */
            lastEndpoint?: (string|null);

            /** PeerStatus lastSeen */
            lastSeen?: (google.protobuf.ITimestamp|null);

            /** PeerStatus rxBytes */
            rxBytes?: (number|Long|null);

            /** PeerStatus txBytes */
            txBytes?: (number|Long|null);
        }

        /** Represents a PeerStatus. */
        class PeerStatus implements IPeerStatus {

            /**
             * Constructs a new PeerStatus.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IPeerStatus);

            /** PeerStatus isActive. */
            public isActive: boolean;

            /** PeerStatus lastEndpoint. */
            public lastEndpoint?: (string|null);

            /** PeerStatus lastSeen. */
            public lastSeen?: (google.protobuf.ITimestamp|null);

            /** PeerStatus rxBytes. */
            public rxBytes: (number|Long);

            /** PeerStatus txBytes. */
            public txBytes: (number|Long);

            /**
             * Creates a new PeerStatus instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PeerStatus instance
             */
            public static create(properties?: router.manager.IPeerStatus): router.manager.PeerStatus;

            /**
             * Encodes the specified PeerStatus message. Does not implicitly {@link router.manager.PeerStatus.verify|verify} messages.
             * @param message PeerStatus message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IPeerStatus, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PeerStatus message, length delimited. Does not implicitly {@link router.manager.PeerStatus.verify|verify} messages.
             * @param message PeerStatus message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IPeerStatus, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PeerStatus message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PeerStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.PeerStatus;

            /**
             * Decodes a PeerStatus message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PeerStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.PeerStatus;

            /**
             * Verifies a PeerStatus message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PeerStatus message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PeerStatus
             */
            public static fromObject(object: { [k: string]: any }): router.manager.PeerStatus;

            /**
             * Creates a plain object from a PeerStatus message. Also converts values to other types if specified.
             * @param message PeerStatus
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.PeerStatus, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PeerStatus to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PeerStatus
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Event. */
        interface IEvent {

            /** Event timestamp */
            timestamp?: (google.protobuf.ITimestamp|null);

            /** Event peerId */
            peerId?: (string|null);

            /** Event connected */
            connected?: (router.manager.IPeerConnected|null);

            /** Event disconnected */
            disconnected?: (router.manager.IPeerDisconnected|null);

            /** Event traffic */
            traffic?: (router.manager.ITrafficUpdate|null);

            /** Event protocol */
            protocol?: (router.manager.IProtocolSpecificEvent|null);
        }

        /** Represents an Event. */
        class Event implements IEvent {

            /**
             * Constructs a new Event.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IEvent);

            /** Event timestamp. */
            public timestamp?: (google.protobuf.ITimestamp|null);

            /** Event peerId. */
            public peerId: string;

            /** Event connected. */
            public connected?: (router.manager.IPeerConnected|null);

            /** Event disconnected. */
            public disconnected?: (router.manager.IPeerDisconnected|null);

            /** Event traffic. */
            public traffic?: (router.manager.ITrafficUpdate|null);

            /** Event protocol. */
            public protocol?: (router.manager.IProtocolSpecificEvent|null);

            /** Event eventType. */
            public eventType?: ("connected"|"disconnected"|"traffic"|"protocol");

            /**
             * Creates a new Event instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Event instance
             */
            public static create(properties?: router.manager.IEvent): router.manager.Event;

            /**
             * Encodes the specified Event message. Does not implicitly {@link router.manager.Event.verify|verify} messages.
             * @param message Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Event message, length delimited. Does not implicitly {@link router.manager.Event.verify|verify} messages.
             * @param message Event message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Event message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.Event;

            /**
             * Decodes an Event message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.Event;

            /**
             * Verifies an Event message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Event message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Event
             */
            public static fromObject(object: { [k: string]: any }): router.manager.Event;

            /**
             * Creates a plain object from an Event message. Also converts values to other types if specified.
             * @param message Event
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Event to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Event
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PeerConnected. */
        interface IPeerConnected {

            /** PeerConnected endpoint */
            endpoint?: (string|null);
        }

        /** Represents a PeerConnected. */
        class PeerConnected implements IPeerConnected {

            /**
             * Constructs a new PeerConnected.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IPeerConnected);

            /** PeerConnected endpoint. */
            public endpoint: string;

            /**
             * Creates a new PeerConnected instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PeerConnected instance
             */
            public static create(properties?: router.manager.IPeerConnected): router.manager.PeerConnected;

            /**
             * Encodes the specified PeerConnected message. Does not implicitly {@link router.manager.PeerConnected.verify|verify} messages.
             * @param message PeerConnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IPeerConnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PeerConnected message, length delimited. Does not implicitly {@link router.manager.PeerConnected.verify|verify} messages.
             * @param message PeerConnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IPeerConnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PeerConnected message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PeerConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.PeerConnected;

            /**
             * Decodes a PeerConnected message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PeerConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.PeerConnected;

            /**
             * Verifies a PeerConnected message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PeerConnected message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PeerConnected
             */
            public static fromObject(object: { [k: string]: any }): router.manager.PeerConnected;

            /**
             * Creates a plain object from a PeerConnected message. Also converts values to other types if specified.
             * @param message PeerConnected
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.PeerConnected, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PeerConnected to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PeerConnected
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PeerDisconnected. */
        interface IPeerDisconnected {
        }

        /** Represents a PeerDisconnected. */
        class PeerDisconnected implements IPeerDisconnected {

            /**
             * Constructs a new PeerDisconnected.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IPeerDisconnected);

            /**
             * Creates a new PeerDisconnected instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PeerDisconnected instance
             */
            public static create(properties?: router.manager.IPeerDisconnected): router.manager.PeerDisconnected;

            /**
             * Encodes the specified PeerDisconnected message. Does not implicitly {@link router.manager.PeerDisconnected.verify|verify} messages.
             * @param message PeerDisconnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IPeerDisconnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PeerDisconnected message, length delimited. Does not implicitly {@link router.manager.PeerDisconnected.verify|verify} messages.
             * @param message PeerDisconnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IPeerDisconnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PeerDisconnected message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PeerDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.PeerDisconnected;

            /**
             * Decodes a PeerDisconnected message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PeerDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.PeerDisconnected;

            /**
             * Verifies a PeerDisconnected message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PeerDisconnected message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PeerDisconnected
             */
            public static fromObject(object: { [k: string]: any }): router.manager.PeerDisconnected;

            /**
             * Creates a plain object from a PeerDisconnected message. Also converts values to other types if specified.
             * @param message PeerDisconnected
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.PeerDisconnected, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PeerDisconnected to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PeerDisconnected
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TrafficUpdate. */
        interface ITrafficUpdate {

            /** TrafficUpdate rxBytes */
            rxBytes?: (number|Long|null);

            /** TrafficUpdate txBytes */
            txBytes?: (number|Long|null);
        }

        /** Represents a TrafficUpdate. */
        class TrafficUpdate implements ITrafficUpdate {

            /**
             * Constructs a new TrafficUpdate.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.ITrafficUpdate);

            /** TrafficUpdate rxBytes. */
            public rxBytes: (number|Long);

            /** TrafficUpdate txBytes. */
            public txBytes: (number|Long);

            /**
             * Creates a new TrafficUpdate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TrafficUpdate instance
             */
            public static create(properties?: router.manager.ITrafficUpdate): router.manager.TrafficUpdate;

            /**
             * Encodes the specified TrafficUpdate message. Does not implicitly {@link router.manager.TrafficUpdate.verify|verify} messages.
             * @param message TrafficUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.ITrafficUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TrafficUpdate message, length delimited. Does not implicitly {@link router.manager.TrafficUpdate.verify|verify} messages.
             * @param message TrafficUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.ITrafficUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TrafficUpdate message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TrafficUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.TrafficUpdate;

            /**
             * Decodes a TrafficUpdate message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TrafficUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.TrafficUpdate;

            /**
             * Verifies a TrafficUpdate message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TrafficUpdate message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TrafficUpdate
             */
            public static fromObject(object: { [k: string]: any }): router.manager.TrafficUpdate;

            /**
             * Creates a plain object from a TrafficUpdate message. Also converts values to other types if specified.
             * @param message TrafficUpdate
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.TrafficUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TrafficUpdate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TrafficUpdate
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WireGuardGlobalState. */
        interface IWireGuardGlobalState {

            /** WireGuardGlobalState publicKey */
            publicKey?: (string|null);
        }

        /** Represents a WireGuardGlobalState. */
        class WireGuardGlobalState implements IWireGuardGlobalState {

            /**
             * Constructs a new WireGuardGlobalState.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IWireGuardGlobalState);

            /** WireGuardGlobalState publicKey. */
            public publicKey: string;

            /**
             * Creates a new WireGuardGlobalState instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WireGuardGlobalState instance
             */
            public static create(properties?: router.manager.IWireGuardGlobalState): router.manager.WireGuardGlobalState;

            /**
             * Encodes the specified WireGuardGlobalState message. Does not implicitly {@link router.manager.WireGuardGlobalState.verify|verify} messages.
             * @param message WireGuardGlobalState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IWireGuardGlobalState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WireGuardGlobalState message, length delimited. Does not implicitly {@link router.manager.WireGuardGlobalState.verify|verify} messages.
             * @param message WireGuardGlobalState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IWireGuardGlobalState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WireGuardGlobalState message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WireGuardGlobalState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.WireGuardGlobalState;

            /**
             * Decodes a WireGuardGlobalState message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WireGuardGlobalState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.WireGuardGlobalState;

            /**
             * Verifies a WireGuardGlobalState message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WireGuardGlobalState message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WireGuardGlobalState
             */
            public static fromObject(object: { [k: string]: any }): router.manager.WireGuardGlobalState;

            /**
             * Creates a plain object from a WireGuardGlobalState message. Also converts values to other types if specified.
             * @param message WireGuardGlobalState
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.WireGuardGlobalState, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WireGuardGlobalState to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WireGuardGlobalState
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WireGuardGlobalConfig. */
        interface IWireGuardGlobalConfig {

            /** WireGuardGlobalConfig privateKey */
            privateKey?: (string|null);
        }

        /** Represents a WireGuardGlobalConfig. */
        class WireGuardGlobalConfig implements IWireGuardGlobalConfig {

            /**
             * Constructs a new WireGuardGlobalConfig.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IWireGuardGlobalConfig);

            /** WireGuardGlobalConfig privateKey. */
            public privateKey?: (string|null);

            /**
             * Creates a new WireGuardGlobalConfig instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WireGuardGlobalConfig instance
             */
            public static create(properties?: router.manager.IWireGuardGlobalConfig): router.manager.WireGuardGlobalConfig;

            /**
             * Encodes the specified WireGuardGlobalConfig message. Does not implicitly {@link router.manager.WireGuardGlobalConfig.verify|verify} messages.
             * @param message WireGuardGlobalConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IWireGuardGlobalConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WireGuardGlobalConfig message, length delimited. Does not implicitly {@link router.manager.WireGuardGlobalConfig.verify|verify} messages.
             * @param message WireGuardGlobalConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IWireGuardGlobalConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WireGuardGlobalConfig message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WireGuardGlobalConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.WireGuardGlobalConfig;

            /**
             * Decodes a WireGuardGlobalConfig message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WireGuardGlobalConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.WireGuardGlobalConfig;

            /**
             * Verifies a WireGuardGlobalConfig message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WireGuardGlobalConfig message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WireGuardGlobalConfig
             */
            public static fromObject(object: { [k: string]: any }): router.manager.WireGuardGlobalConfig;

            /**
             * Creates a plain object from a WireGuardGlobalConfig message. Also converts values to other types if specified.
             * @param message WireGuardGlobalConfig
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.WireGuardGlobalConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WireGuardGlobalConfig to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WireGuardGlobalConfig
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WireGuardPeerConfig. */
        interface IWireGuardPeerConfig {

            /** WireGuardPeerConfig publicKey */
            publicKey?: (string|null);

            /** WireGuardPeerConfig persistentKeepalive */
            persistentKeepalive?: (google.protobuf.IDuration|null);

            /** WireGuardPeerConfig allowedIps */
            allowedIps?: (string[]|null);
        }

        /** Represents a WireGuardPeerConfig. */
        class WireGuardPeerConfig implements IWireGuardPeerConfig {

            /**
             * Constructs a new WireGuardPeerConfig.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IWireGuardPeerConfig);

            /** WireGuardPeerConfig publicKey. */
            public publicKey: string;

            /** WireGuardPeerConfig persistentKeepalive. */
            public persistentKeepalive?: (google.protobuf.IDuration|null);

            /** WireGuardPeerConfig allowedIps. */
            public allowedIps: string[];

            /**
             * Creates a new WireGuardPeerConfig instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WireGuardPeerConfig instance
             */
            public static create(properties?: router.manager.IWireGuardPeerConfig): router.manager.WireGuardPeerConfig;

            /**
             * Encodes the specified WireGuardPeerConfig message. Does not implicitly {@link router.manager.WireGuardPeerConfig.verify|verify} messages.
             * @param message WireGuardPeerConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IWireGuardPeerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WireGuardPeerConfig message, length delimited. Does not implicitly {@link router.manager.WireGuardPeerConfig.verify|verify} messages.
             * @param message WireGuardPeerConfig message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IWireGuardPeerConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WireGuardPeerConfig message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WireGuardPeerConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.WireGuardPeerConfig;

            /**
             * Decodes a WireGuardPeerConfig message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WireGuardPeerConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.WireGuardPeerConfig;

            /**
             * Verifies a WireGuardPeerConfig message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WireGuardPeerConfig message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WireGuardPeerConfig
             */
            public static fromObject(object: { [k: string]: any }): router.manager.WireGuardPeerConfig;

            /**
             * Creates a plain object from a WireGuardPeerConfig message. Also converts values to other types if specified.
             * @param message WireGuardPeerConfig
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.WireGuardPeerConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WireGuardPeerConfig to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WireGuardPeerConfig
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ProtocolSpecificEvent. */
        interface IProtocolSpecificEvent {

            /** ProtocolSpecificEvent protocolName */
            protocolName?: (string|null);

            /** ProtocolSpecificEvent metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a ProtocolSpecificEvent. */
        class ProtocolSpecificEvent implements IProtocolSpecificEvent {

            /**
             * Constructs a new ProtocolSpecificEvent.
             * @param [properties] Properties to set
             */
            constructor(properties?: router.manager.IProtocolSpecificEvent);

            /** ProtocolSpecificEvent protocolName. */
            public protocolName: string;

            /** ProtocolSpecificEvent metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new ProtocolSpecificEvent instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ProtocolSpecificEvent instance
             */
            public static create(properties?: router.manager.IProtocolSpecificEvent): router.manager.ProtocolSpecificEvent;

            /**
             * Encodes the specified ProtocolSpecificEvent message. Does not implicitly {@link router.manager.ProtocolSpecificEvent.verify|verify} messages.
             * @param message ProtocolSpecificEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: router.manager.IProtocolSpecificEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ProtocolSpecificEvent message, length delimited. Does not implicitly {@link router.manager.ProtocolSpecificEvent.verify|verify} messages.
             * @param message ProtocolSpecificEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: router.manager.IProtocolSpecificEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ProtocolSpecificEvent message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ProtocolSpecificEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): router.manager.ProtocolSpecificEvent;

            /**
             * Decodes a ProtocolSpecificEvent message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ProtocolSpecificEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): router.manager.ProtocolSpecificEvent;

            /**
             * Verifies a ProtocolSpecificEvent message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ProtocolSpecificEvent message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ProtocolSpecificEvent
             */
            public static fromObject(object: { [k: string]: any }): router.manager.ProtocolSpecificEvent;

            /**
             * Creates a plain object from a ProtocolSpecificEvent message. Also converts values to other types if specified.
             * @param message ProtocolSpecificEvent
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: router.manager.ProtocolSpecificEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ProtocolSpecificEvent to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ProtocolSpecificEvent
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Duration. */
        interface IDuration {

            /** Duration seconds */
            seconds?: (number|Long|null);

            /** Duration nanos */
            nanos?: (number|null);
        }

        /** Represents a Duration. */
        class Duration implements IDuration {

            /**
             * Constructs a new Duration.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDuration);

            /** Duration seconds. */
            public seconds: (number|Long);

            /** Duration nanos. */
            public nanos: number;

            /**
             * Creates a new Duration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Duration instance
             */
            public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Duration;

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Duration;

            /**
             * Verifies a Duration message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Duration
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Duration;

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @param message Duration
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Duration, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Duration to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Duration
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Empty. */
        interface IEmpty {
        }

        /** Represents an Empty. */
        class Empty implements IEmpty {

            /**
             * Constructs a new Empty.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEmpty);

            /**
             * Creates a new Empty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Empty instance
             */
            public static create(properties?: google.protobuf.IEmpty): google.protobuf.Empty;

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Empty message, length delimited. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Empty;

            /**
             * Decodes an Empty message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Empty;

            /**
             * Verifies an Empty message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Empty
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Empty;

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @param message Empty
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Empty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Empty
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
