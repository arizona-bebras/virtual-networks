/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.router = (function() {

    /**
     * Namespace router.
     * @exports router
     * @namespace
     */
    var router = {};

    router.manager = (function() {

        /**
         * Namespace manager.
         * @memberof router
         * @namespace
         */
        var manager = {};

        manager.RouterManager = (function() {

            /**
             * Constructs a new RouterManager service.
             * @memberof router.manager
             * @classdesc Represents a RouterManager
             * @extends $protobuf.rpc.Service
             * @constructor
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             */
            function RouterManager(rpcImpl, requestDelimited, responseDelimited) {
                $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
            }

            (RouterManager.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = RouterManager;

            /**
             * Creates new RouterManager service using the specified rpc implementation.
             * @function create
             * @memberof router.manager.RouterManager
             * @static
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             * @returns {RouterManager} RPC service. Useful where requests and/or responses are streamed.
             */
            RouterManager.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                return new this(rpcImpl, requestDelimited, responseDelimited);
            };

            /**
             * Callback as used by {@link router.manager.RouterManager#getInfo}.
             * @memberof router.manager.RouterManager
             * @typedef GetInfoCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {router.manager.RouterInfo} [response] RouterInfo
             */

            /**
             * Calls GetInfo.
             * @function getInfo
             * @memberof router.manager.RouterManager
             * @instance
             * @param {google.protobuf.IEmpty} request Empty message or plain object
             * @param {router.manager.RouterManager.GetInfoCallback} callback Node-style callback called with the error, if any, and RouterInfo
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.getInfo = function getInfo(request, callback) {
                return this.rpcCall(getInfo, $root.google.protobuf.Empty, $root.router.manager.RouterInfo, request, callback);
            }, "name", { value: "GetInfo" });

            /**
             * Calls GetInfo.
             * @function getInfo
             * @memberof router.manager.RouterManager
             * @instance
             * @param {google.protobuf.IEmpty} request Empty message or plain object
             * @returns {Promise<router.manager.RouterInfo>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link router.manager.RouterManager#configure}.
             * @memberof router.manager.RouterManager
             * @typedef ConfigureCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {router.manager.RouterInfo} [response] RouterInfo
             */

            /**
             * Calls Configure.
             * @function configure
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IConfigureRequest} request ConfigureRequest message or plain object
             * @param {router.manager.RouterManager.ConfigureCallback} callback Node-style callback called with the error, if any, and RouterInfo
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.configure = function configure(request, callback) {
                return this.rpcCall(configure, $root.router.manager.ConfigureRequest, $root.router.manager.RouterInfo, request, callback);
            }, "name", { value: "Configure" });

            /**
             * Calls Configure.
             * @function configure
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IConfigureRequest} request ConfigureRequest message or plain object
             * @returns {Promise<router.manager.RouterInfo>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link router.manager.RouterManager#upsertPeer}.
             * @memberof router.manager.RouterManager
             * @typedef UpsertPeerCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {google.protobuf.Empty} [response] Empty
             */

            /**
             * Calls UpsertPeer.
             * @function upsertPeer
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IUpsertPeerRequest} request UpsertPeerRequest message or plain object
             * @param {router.manager.RouterManager.UpsertPeerCallback} callback Node-style callback called with the error, if any, and Empty
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.upsertPeer = function upsertPeer(request, callback) {
                return this.rpcCall(upsertPeer, $root.router.manager.UpsertPeerRequest, $root.google.protobuf.Empty, request, callback);
            }, "name", { value: "UpsertPeer" });

            /**
             * Calls UpsertPeer.
             * @function upsertPeer
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IUpsertPeerRequest} request UpsertPeerRequest message or plain object
             * @returns {Promise<google.protobuf.Empty>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link router.manager.RouterManager#deletePeer}.
             * @memberof router.manager.RouterManager
             * @typedef DeletePeerCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {google.protobuf.Empty} [response] Empty
             */

            /**
             * Calls DeletePeer.
             * @function deletePeer
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IDeletePeerRequest} request DeletePeerRequest message or plain object
             * @param {router.manager.RouterManager.DeletePeerCallback} callback Node-style callback called with the error, if any, and Empty
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.deletePeer = function deletePeer(request, callback) {
                return this.rpcCall(deletePeer, $root.router.manager.DeletePeerRequest, $root.google.protobuf.Empty, request, callback);
            }, "name", { value: "DeletePeer" });

            /**
             * Calls DeletePeer.
             * @function deletePeer
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IDeletePeerRequest} request DeletePeerRequest message or plain object
             * @returns {Promise<google.protobuf.Empty>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link router.manager.RouterManager#listPeers}.
             * @memberof router.manager.RouterManager
             * @typedef ListPeersCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {router.manager.ListPeersResponse} [response] ListPeersResponse
             */

            /**
             * Calls ListPeers.
             * @function listPeers
             * @memberof router.manager.RouterManager
             * @instance
             * @param {google.protobuf.IEmpty} request Empty message or plain object
             * @param {router.manager.RouterManager.ListPeersCallback} callback Node-style callback called with the error, if any, and ListPeersResponse
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.listPeers = function listPeers(request, callback) {
                return this.rpcCall(listPeers, $root.google.protobuf.Empty, $root.router.manager.ListPeersResponse, request, callback);
            }, "name", { value: "ListPeers" });

            /**
             * Calls ListPeers.
             * @function listPeers
             * @memberof router.manager.RouterManager
             * @instance
             * @param {google.protobuf.IEmpty} request Empty message or plain object
             * @returns {Promise<router.manager.ListPeersResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link router.manager.RouterManager#watchEvents}.
             * @memberof router.manager.RouterManager
             * @typedef WatchEventsCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {router.manager.Event} [response] Event
             */

            /**
             * Calls WatchEvents.
             * @function watchEvents
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IWatchEventsRequest} request WatchEventsRequest message or plain object
             * @param {router.manager.RouterManager.WatchEventsCallback} callback Node-style callback called with the error, if any, and Event
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RouterManager.prototype.watchEvents = function watchEvents(request, callback) {
                return this.rpcCall(watchEvents, $root.router.manager.WatchEventsRequest, $root.router.manager.Event, request, callback);
            }, "name", { value: "WatchEvents" });

            /**
             * Calls WatchEvents.
             * @function watchEvents
             * @memberof router.manager.RouterManager
             * @instance
             * @param {router.manager.IWatchEventsRequest} request WatchEventsRequest message or plain object
             * @returns {Promise<router.manager.Event>} Promise
             * @variation 2
             */

            return RouterManager;
        })();

        manager.ConfigureRequest = (function() {

            /**
             * Properties of a ConfigureRequest.
             * @memberof router.manager
             * @interface IConfigureRequest
             * @property {router.manager.INetworkConfig|null} [config] ConfigureRequest config
             * @property {router.manager.IWireGuardGlobalConfig|null} [wireguard] ConfigureRequest wireguard
             */

            /**
             * Constructs a new ConfigureRequest.
             * @memberof router.manager
             * @classdesc Represents a ConfigureRequest.
             * @implements IConfigureRequest
             * @constructor
             * @param {router.manager.IConfigureRequest=} [properties] Properties to set
             */
            function ConfigureRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ConfigureRequest config.
             * @member {router.manager.INetworkConfig|null|undefined} config
             * @memberof router.manager.ConfigureRequest
             * @instance
             */
            ConfigureRequest.prototype.config = null;

            /**
             * ConfigureRequest wireguard.
             * @member {router.manager.IWireGuardGlobalConfig|null|undefined} wireguard
             * @memberof router.manager.ConfigureRequest
             * @instance
             */
            ConfigureRequest.prototype.wireguard = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * ConfigureRequest protocolConfig.
             * @member {"wireguard"|undefined} protocolConfig
             * @memberof router.manager.ConfigureRequest
             * @instance
             */
            Object.defineProperty(ConfigureRequest.prototype, "protocolConfig", {
                get: $util.oneOfGetter($oneOfFields = ["wireguard"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ConfigureRequest instance using the specified properties.
             * @function create
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {router.manager.IConfigureRequest=} [properties] Properties to set
             * @returns {router.manager.ConfigureRequest} ConfigureRequest instance
             */
            ConfigureRequest.create = function create(properties) {
                return new ConfigureRequest(properties);
            };

            /**
             * Encodes the specified ConfigureRequest message. Does not implicitly {@link router.manager.ConfigureRequest.verify|verify} messages.
             * @function encode
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {router.manager.IConfigureRequest} message ConfigureRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConfigureRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                    $root.router.manager.NetworkConfig.encode(message.config, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.wireguard != null && Object.hasOwnProperty.call(message, "wireguard"))
                    $root.router.manager.WireGuardGlobalConfig.encode(message.wireguard, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ConfigureRequest message, length delimited. Does not implicitly {@link router.manager.ConfigureRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {router.manager.IConfigureRequest} message ConfigureRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConfigureRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ConfigureRequest message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.ConfigureRequest} ConfigureRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConfigureRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.ConfigureRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.config = $root.router.manager.NetworkConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.wireguard = $root.router.manager.WireGuardGlobalConfig.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ConfigureRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.ConfigureRequest} ConfigureRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConfigureRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ConfigureRequest message.
             * @function verify
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ConfigureRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.config != null && message.hasOwnProperty("config")) {
                    var error = $root.router.manager.NetworkConfig.verify(message.config);
                    if (error)
                        return "config." + error;
                }
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    properties.protocolConfig = 1;
                    {
                        var error = $root.router.manager.WireGuardGlobalConfig.verify(message.wireguard);
                        if (error)
                            return "wireguard." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ConfigureRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.ConfigureRequest} ConfigureRequest
             */
            ConfigureRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.ConfigureRequest)
                    return object;
                var message = new $root.router.manager.ConfigureRequest();
                if (object.config != null) {
                    if (typeof object.config !== "object")
                        throw TypeError(".router.manager.ConfigureRequest.config: object expected");
                    message.config = $root.router.manager.NetworkConfig.fromObject(object.config);
                }
                if (object.wireguard != null) {
                    if (typeof object.wireguard !== "object")
                        throw TypeError(".router.manager.ConfigureRequest.wireguard: object expected");
                    message.wireguard = $root.router.manager.WireGuardGlobalConfig.fromObject(object.wireguard);
                }
                return message;
            };

            /**
             * Creates a plain object from a ConfigureRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {router.manager.ConfigureRequest} message ConfigureRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ConfigureRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.config = null;
                if (message.config != null && message.hasOwnProperty("config"))
                    object.config = $root.router.manager.NetworkConfig.toObject(message.config, options);
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    object.wireguard = $root.router.manager.WireGuardGlobalConfig.toObject(message.wireguard, options);
                    if (options.oneofs)
                        object.protocolConfig = "wireguard";
                }
                return object;
            };

            /**
             * Converts this ConfigureRequest to JSON.
             * @function toJSON
             * @memberof router.manager.ConfigureRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ConfigureRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ConfigureRequest
             * @function getTypeUrl
             * @memberof router.manager.ConfigureRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ConfigureRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.ConfigureRequest";
            };

            return ConfigureRequest;
        })();

        manager.UpsertPeerRequest = (function() {

            /**
             * Properties of an UpsertPeerRequest.
             * @memberof router.manager
             * @interface IUpsertPeerRequest
             * @property {router.manager.IPeer|null} [peer] UpsertPeerRequest peer
             */

            /**
             * Constructs a new UpsertPeerRequest.
             * @memberof router.manager
             * @classdesc Represents an UpsertPeerRequest.
             * @implements IUpsertPeerRequest
             * @constructor
             * @param {router.manager.IUpsertPeerRequest=} [properties] Properties to set
             */
            function UpsertPeerRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpsertPeerRequest peer.
             * @member {router.manager.IPeer|null|undefined} peer
             * @memberof router.manager.UpsertPeerRequest
             * @instance
             */
            UpsertPeerRequest.prototype.peer = null;

            /**
             * Creates a new UpsertPeerRequest instance using the specified properties.
             * @function create
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {router.manager.IUpsertPeerRequest=} [properties] Properties to set
             * @returns {router.manager.UpsertPeerRequest} UpsertPeerRequest instance
             */
            UpsertPeerRequest.create = function create(properties) {
                return new UpsertPeerRequest(properties);
            };

            /**
             * Encodes the specified UpsertPeerRequest message. Does not implicitly {@link router.manager.UpsertPeerRequest.verify|verify} messages.
             * @function encode
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {router.manager.IUpsertPeerRequest} message UpsertPeerRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpsertPeerRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.peer != null && Object.hasOwnProperty.call(message, "peer"))
                    $root.router.manager.Peer.encode(message.peer, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpsertPeerRequest message, length delimited. Does not implicitly {@link router.manager.UpsertPeerRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {router.manager.IUpsertPeerRequest} message UpsertPeerRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpsertPeerRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpsertPeerRequest message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.UpsertPeerRequest} UpsertPeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpsertPeerRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.UpsertPeerRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.peer = $root.router.manager.Peer.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an UpsertPeerRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.UpsertPeerRequest} UpsertPeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpsertPeerRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpsertPeerRequest message.
             * @function verify
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpsertPeerRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.peer != null && message.hasOwnProperty("peer")) {
                    var error = $root.router.manager.Peer.verify(message.peer);
                    if (error)
                        return "peer." + error;
                }
                return null;
            };

            /**
             * Creates an UpsertPeerRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.UpsertPeerRequest} UpsertPeerRequest
             */
            UpsertPeerRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.UpsertPeerRequest)
                    return object;
                var message = new $root.router.manager.UpsertPeerRequest();
                if (object.peer != null) {
                    if (typeof object.peer !== "object")
                        throw TypeError(".router.manager.UpsertPeerRequest.peer: object expected");
                    message.peer = $root.router.manager.Peer.fromObject(object.peer);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpsertPeerRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {router.manager.UpsertPeerRequest} message UpsertPeerRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpsertPeerRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.peer = null;
                if (message.peer != null && message.hasOwnProperty("peer"))
                    object.peer = $root.router.manager.Peer.toObject(message.peer, options);
                return object;
            };

            /**
             * Converts this UpsertPeerRequest to JSON.
             * @function toJSON
             * @memberof router.manager.UpsertPeerRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpsertPeerRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpsertPeerRequest
             * @function getTypeUrl
             * @memberof router.manager.UpsertPeerRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpsertPeerRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.UpsertPeerRequest";
            };

            return UpsertPeerRequest;
        })();

        manager.DeletePeerRequest = (function() {

            /**
             * Properties of a DeletePeerRequest.
             * @memberof router.manager
             * @interface IDeletePeerRequest
             * @property {string|null} [id] DeletePeerRequest id
             */

            /**
             * Constructs a new DeletePeerRequest.
             * @memberof router.manager
             * @classdesc Represents a DeletePeerRequest.
             * @implements IDeletePeerRequest
             * @constructor
             * @param {router.manager.IDeletePeerRequest=} [properties] Properties to set
             */
            function DeletePeerRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeletePeerRequest id.
             * @member {string} id
             * @memberof router.manager.DeletePeerRequest
             * @instance
             */
            DeletePeerRequest.prototype.id = "";

            /**
             * Creates a new DeletePeerRequest instance using the specified properties.
             * @function create
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {router.manager.IDeletePeerRequest=} [properties] Properties to set
             * @returns {router.manager.DeletePeerRequest} DeletePeerRequest instance
             */
            DeletePeerRequest.create = function create(properties) {
                return new DeletePeerRequest(properties);
            };

            /**
             * Encodes the specified DeletePeerRequest message. Does not implicitly {@link router.manager.DeletePeerRequest.verify|verify} messages.
             * @function encode
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {router.manager.IDeletePeerRequest} message DeletePeerRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeletePeerRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeletePeerRequest message, length delimited. Does not implicitly {@link router.manager.DeletePeerRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {router.manager.IDeletePeerRequest} message DeletePeerRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeletePeerRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeletePeerRequest message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.DeletePeerRequest} DeletePeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeletePeerRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.DeletePeerRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeletePeerRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.DeletePeerRequest} DeletePeerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeletePeerRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeletePeerRequest message.
             * @function verify
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeletePeerRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a DeletePeerRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.DeletePeerRequest} DeletePeerRequest
             */
            DeletePeerRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.DeletePeerRequest)
                    return object;
                var message = new $root.router.manager.DeletePeerRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a DeletePeerRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {router.manager.DeletePeerRequest} message DeletePeerRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeletePeerRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.id = "";
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this DeletePeerRequest to JSON.
             * @function toJSON
             * @memberof router.manager.DeletePeerRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeletePeerRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeletePeerRequest
             * @function getTypeUrl
             * @memberof router.manager.DeletePeerRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeletePeerRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.DeletePeerRequest";
            };

            return DeletePeerRequest;
        })();

        manager.ListPeersResponse = (function() {

            /**
             * Properties of a ListPeersResponse.
             * @memberof router.manager
             * @interface IListPeersResponse
             * @property {Array.<router.manager.IPeer>|null} [peers] ListPeersResponse peers
             */

            /**
             * Constructs a new ListPeersResponse.
             * @memberof router.manager
             * @classdesc Represents a ListPeersResponse.
             * @implements IListPeersResponse
             * @constructor
             * @param {router.manager.IListPeersResponse=} [properties] Properties to set
             */
            function ListPeersResponse(properties) {
                this.peers = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListPeersResponse peers.
             * @member {Array.<router.manager.IPeer>} peers
             * @memberof router.manager.ListPeersResponse
             * @instance
             */
            ListPeersResponse.prototype.peers = $util.emptyArray;

            /**
             * Creates a new ListPeersResponse instance using the specified properties.
             * @function create
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {router.manager.IListPeersResponse=} [properties] Properties to set
             * @returns {router.manager.ListPeersResponse} ListPeersResponse instance
             */
            ListPeersResponse.create = function create(properties) {
                return new ListPeersResponse(properties);
            };

            /**
             * Encodes the specified ListPeersResponse message. Does not implicitly {@link router.manager.ListPeersResponse.verify|verify} messages.
             * @function encode
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {router.manager.IListPeersResponse} message ListPeersResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListPeersResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.peers != null && message.peers.length)
                    for (var i = 0; i < message.peers.length; ++i)
                        $root.router.manager.Peer.encode(message.peers[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListPeersResponse message, length delimited. Does not implicitly {@link router.manager.ListPeersResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {router.manager.IListPeersResponse} message ListPeersResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListPeersResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListPeersResponse message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.ListPeersResponse} ListPeersResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListPeersResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.ListPeersResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.peers && message.peers.length))
                                message.peers = [];
                            message.peers.push($root.router.manager.Peer.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ListPeersResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.ListPeersResponse} ListPeersResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListPeersResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListPeersResponse message.
             * @function verify
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListPeersResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.peers != null && message.hasOwnProperty("peers")) {
                    if (!Array.isArray(message.peers))
                        return "peers: array expected";
                    for (var i = 0; i < message.peers.length; ++i) {
                        var error = $root.router.manager.Peer.verify(message.peers[i]);
                        if (error)
                            return "peers." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ListPeersResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.ListPeersResponse} ListPeersResponse
             */
            ListPeersResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.ListPeersResponse)
                    return object;
                var message = new $root.router.manager.ListPeersResponse();
                if (object.peers) {
                    if (!Array.isArray(object.peers))
                        throw TypeError(".router.manager.ListPeersResponse.peers: array expected");
                    message.peers = [];
                    for (var i = 0; i < object.peers.length; ++i) {
                        if (typeof object.peers[i] !== "object")
                            throw TypeError(".router.manager.ListPeersResponse.peers: object expected");
                        message.peers[i] = $root.router.manager.Peer.fromObject(object.peers[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ListPeersResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {router.manager.ListPeersResponse} message ListPeersResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListPeersResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.peers = [];
                if (message.peers && message.peers.length) {
                    object.peers = [];
                    for (var j = 0; j < message.peers.length; ++j)
                        object.peers[j] = $root.router.manager.Peer.toObject(message.peers[j], options);
                }
                return object;
            };

            /**
             * Converts this ListPeersResponse to JSON.
             * @function toJSON
             * @memberof router.manager.ListPeersResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListPeersResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListPeersResponse
             * @function getTypeUrl
             * @memberof router.manager.ListPeersResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListPeersResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.ListPeersResponse";
            };

            return ListPeersResponse;
        })();

        manager.WatchEventsRequest = (function() {

            /**
             * Properties of a WatchEventsRequest.
             * @memberof router.manager
             * @interface IWatchEventsRequest
             * @property {Array.<string>|null} [peerIds] WatchEventsRequest peerIds
             */

            /**
             * Constructs a new WatchEventsRequest.
             * @memberof router.manager
             * @classdesc Represents a WatchEventsRequest.
             * @implements IWatchEventsRequest
             * @constructor
             * @param {router.manager.IWatchEventsRequest=} [properties] Properties to set
             */
            function WatchEventsRequest(properties) {
                this.peerIds = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WatchEventsRequest peerIds.
             * @member {Array.<string>} peerIds
             * @memberof router.manager.WatchEventsRequest
             * @instance
             */
            WatchEventsRequest.prototype.peerIds = $util.emptyArray;

            /**
             * Creates a new WatchEventsRequest instance using the specified properties.
             * @function create
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {router.manager.IWatchEventsRequest=} [properties] Properties to set
             * @returns {router.manager.WatchEventsRequest} WatchEventsRequest instance
             */
            WatchEventsRequest.create = function create(properties) {
                return new WatchEventsRequest(properties);
            };

            /**
             * Encodes the specified WatchEventsRequest message. Does not implicitly {@link router.manager.WatchEventsRequest.verify|verify} messages.
             * @function encode
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {router.manager.IWatchEventsRequest} message WatchEventsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WatchEventsRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.peerIds != null && message.peerIds.length)
                    for (var i = 0; i < message.peerIds.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.peerIds[i]);
                return writer;
            };

            /**
             * Encodes the specified WatchEventsRequest message, length delimited. Does not implicitly {@link router.manager.WatchEventsRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {router.manager.IWatchEventsRequest} message WatchEventsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WatchEventsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WatchEventsRequest message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.WatchEventsRequest} WatchEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WatchEventsRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.WatchEventsRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.peerIds && message.peerIds.length))
                                message.peerIds = [];
                            message.peerIds.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WatchEventsRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.WatchEventsRequest} WatchEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WatchEventsRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WatchEventsRequest message.
             * @function verify
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WatchEventsRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.peerIds != null && message.hasOwnProperty("peerIds")) {
                    if (!Array.isArray(message.peerIds))
                        return "peerIds: array expected";
                    for (var i = 0; i < message.peerIds.length; ++i)
                        if (!$util.isString(message.peerIds[i]))
                            return "peerIds: string[] expected";
                }
                return null;
            };

            /**
             * Creates a WatchEventsRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.WatchEventsRequest} WatchEventsRequest
             */
            WatchEventsRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.WatchEventsRequest)
                    return object;
                var message = new $root.router.manager.WatchEventsRequest();
                if (object.peerIds) {
                    if (!Array.isArray(object.peerIds))
                        throw TypeError(".router.manager.WatchEventsRequest.peerIds: array expected");
                    message.peerIds = [];
                    for (var i = 0; i < object.peerIds.length; ++i)
                        message.peerIds[i] = String(object.peerIds[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a WatchEventsRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {router.manager.WatchEventsRequest} message WatchEventsRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WatchEventsRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.peerIds = [];
                if (message.peerIds && message.peerIds.length) {
                    object.peerIds = [];
                    for (var j = 0; j < message.peerIds.length; ++j)
                        object.peerIds[j] = message.peerIds[j];
                }
                return object;
            };

            /**
             * Converts this WatchEventsRequest to JSON.
             * @function toJSON
             * @memberof router.manager.WatchEventsRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WatchEventsRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WatchEventsRequest
             * @function getTypeUrl
             * @memberof router.manager.WatchEventsRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WatchEventsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.WatchEventsRequest";
            };

            return WatchEventsRequest;
        })();

        manager.RouterInfo = (function() {

            /**
             * Properties of a RouterInfo.
             * @memberof router.manager
             * @interface IRouterInfo
             * @property {string|null} [routerId] RouterInfo routerId
             * @property {string|null} [version] RouterInfo version
             * @property {router.manager.INetworkConfig|null} [config] RouterInfo config
             * @property {router.manager.IWireGuardGlobalState|null} [wireguard] RouterInfo wireguard
             * @property {Array.<string>|null} [supportedProtocols] RouterInfo supportedProtocols
             */

            /**
             * Constructs a new RouterInfo.
             * @memberof router.manager
             * @classdesc Represents a RouterInfo.
             * @implements IRouterInfo
             * @constructor
             * @param {router.manager.IRouterInfo=} [properties] Properties to set
             */
            function RouterInfo(properties) {
                this.supportedProtocols = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RouterInfo routerId.
             * @member {string} routerId
             * @memberof router.manager.RouterInfo
             * @instance
             */
            RouterInfo.prototype.routerId = "";

            /**
             * RouterInfo version.
             * @member {string} version
             * @memberof router.manager.RouterInfo
             * @instance
             */
            RouterInfo.prototype.version = "";

            /**
             * RouterInfo config.
             * @member {router.manager.INetworkConfig|null|undefined} config
             * @memberof router.manager.RouterInfo
             * @instance
             */
            RouterInfo.prototype.config = null;

            /**
             * RouterInfo wireguard.
             * @member {router.manager.IWireGuardGlobalState|null|undefined} wireguard
             * @memberof router.manager.RouterInfo
             * @instance
             */
            RouterInfo.prototype.wireguard = null;

            /**
             * RouterInfo supportedProtocols.
             * @member {Array.<string>} supportedProtocols
             * @memberof router.manager.RouterInfo
             * @instance
             */
            RouterInfo.prototype.supportedProtocols = $util.emptyArray;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * RouterInfo protocolState.
             * @member {"wireguard"|undefined} protocolState
             * @memberof router.manager.RouterInfo
             * @instance
             */
            Object.defineProperty(RouterInfo.prototype, "protocolState", {
                get: $util.oneOfGetter($oneOfFields = ["wireguard"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new RouterInfo instance using the specified properties.
             * @function create
             * @memberof router.manager.RouterInfo
             * @static
             * @param {router.manager.IRouterInfo=} [properties] Properties to set
             * @returns {router.manager.RouterInfo} RouterInfo instance
             */
            RouterInfo.create = function create(properties) {
                return new RouterInfo(properties);
            };

            /**
             * Encodes the specified RouterInfo message. Does not implicitly {@link router.manager.RouterInfo.verify|verify} messages.
             * @function encode
             * @memberof router.manager.RouterInfo
             * @static
             * @param {router.manager.IRouterInfo} message RouterInfo message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RouterInfo.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.routerId != null && Object.hasOwnProperty.call(message, "routerId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.routerId);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.version);
                if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                    $root.router.manager.NetworkConfig.encode(message.config, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.wireguard != null && Object.hasOwnProperty.call(message, "wireguard"))
                    $root.router.manager.WireGuardGlobalState.encode(message.wireguard, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.supportedProtocols != null && message.supportedProtocols.length)
                    for (var i = 0; i < message.supportedProtocols.length; ++i)
                        writer.uint32(/* id 20, wireType 2 =*/162).string(message.supportedProtocols[i]);
                return writer;
            };

            /**
             * Encodes the specified RouterInfo message, length delimited. Does not implicitly {@link router.manager.RouterInfo.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.RouterInfo
             * @static
             * @param {router.manager.IRouterInfo} message RouterInfo message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RouterInfo.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RouterInfo message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.RouterInfo
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.RouterInfo} RouterInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RouterInfo.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.RouterInfo();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.routerId = reader.string();
                            break;
                        }
                    case 2: {
                            message.version = reader.string();
                            break;
                        }
                    case 3: {
                            message.config = $root.router.manager.NetworkConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.wireguard = $root.router.manager.WireGuardGlobalState.decode(reader, reader.uint32());
                            break;
                        }
                    case 20: {
                            if (!(message.supportedProtocols && message.supportedProtocols.length))
                                message.supportedProtocols = [];
                            message.supportedProtocols.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a RouterInfo message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.RouterInfo
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.RouterInfo} RouterInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RouterInfo.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RouterInfo message.
             * @function verify
             * @memberof router.manager.RouterInfo
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RouterInfo.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.routerId != null && message.hasOwnProperty("routerId"))
                    if (!$util.isString(message.routerId))
                        return "routerId: string expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.config != null && message.hasOwnProperty("config")) {
                    var error = $root.router.manager.NetworkConfig.verify(message.config);
                    if (error)
                        return "config." + error;
                }
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    properties.protocolState = 1;
                    {
                        var error = $root.router.manager.WireGuardGlobalState.verify(message.wireguard);
                        if (error)
                            return "wireguard." + error;
                    }
                }
                if (message.supportedProtocols != null && message.hasOwnProperty("supportedProtocols")) {
                    if (!Array.isArray(message.supportedProtocols))
                        return "supportedProtocols: array expected";
                    for (var i = 0; i < message.supportedProtocols.length; ++i)
                        if (!$util.isString(message.supportedProtocols[i]))
                            return "supportedProtocols: string[] expected";
                }
                return null;
            };

            /**
             * Creates a RouterInfo message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.RouterInfo
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.RouterInfo} RouterInfo
             */
            RouterInfo.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.RouterInfo)
                    return object;
                var message = new $root.router.manager.RouterInfo();
                if (object.routerId != null)
                    message.routerId = String(object.routerId);
                if (object.version != null)
                    message.version = String(object.version);
                if (object.config != null) {
                    if (typeof object.config !== "object")
                        throw TypeError(".router.manager.RouterInfo.config: object expected");
                    message.config = $root.router.manager.NetworkConfig.fromObject(object.config);
                }
                if (object.wireguard != null) {
                    if (typeof object.wireguard !== "object")
                        throw TypeError(".router.manager.RouterInfo.wireguard: object expected");
                    message.wireguard = $root.router.manager.WireGuardGlobalState.fromObject(object.wireguard);
                }
                if (object.supportedProtocols) {
                    if (!Array.isArray(object.supportedProtocols))
                        throw TypeError(".router.manager.RouterInfo.supportedProtocols: array expected");
                    message.supportedProtocols = [];
                    for (var i = 0; i < object.supportedProtocols.length; ++i)
                        message.supportedProtocols[i] = String(object.supportedProtocols[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a RouterInfo message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.RouterInfo
             * @static
             * @param {router.manager.RouterInfo} message RouterInfo
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RouterInfo.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.supportedProtocols = [];
                if (options.defaults) {
                    object.routerId = "";
                    object.version = "";
                    object.config = null;
                }
                if (message.routerId != null && message.hasOwnProperty("routerId"))
                    object.routerId = message.routerId;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.config != null && message.hasOwnProperty("config"))
                    object.config = $root.router.manager.NetworkConfig.toObject(message.config, options);
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    object.wireguard = $root.router.manager.WireGuardGlobalState.toObject(message.wireguard, options);
                    if (options.oneofs)
                        object.protocolState = "wireguard";
                }
                if (message.supportedProtocols && message.supportedProtocols.length) {
                    object.supportedProtocols = [];
                    for (var j = 0; j < message.supportedProtocols.length; ++j)
                        object.supportedProtocols[j] = message.supportedProtocols[j];
                }
                return object;
            };

            /**
             * Converts this RouterInfo to JSON.
             * @function toJSON
             * @memberof router.manager.RouterInfo
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RouterInfo.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RouterInfo
             * @function getTypeUrl
             * @memberof router.manager.RouterInfo
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RouterInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.RouterInfo";
            };

            return RouterInfo;
        })();

        manager.NetworkConfig = (function() {

            /**
             * Properties of a NetworkConfig.
             * @memberof router.manager
             * @interface INetworkConfig
             * @property {string|null} [overlayCidr] NetworkConfig overlayCidr
             * @property {string|null} [serverAddress] NetworkConfig serverAddress
             * @property {number|null} [mtu] NetworkConfig mtu
             * @property {string|null} [publicHost] NetworkConfig publicHost
             * @property {number|null} [listenPort] NetworkConfig listenPort
             */

            /**
             * Constructs a new NetworkConfig.
             * @memberof router.manager
             * @classdesc Represents a NetworkConfig.
             * @implements INetworkConfig
             * @constructor
             * @param {router.manager.INetworkConfig=} [properties] Properties to set
             */
            function NetworkConfig(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NetworkConfig overlayCidr.
             * @member {string} overlayCidr
             * @memberof router.manager.NetworkConfig
             * @instance
             */
            NetworkConfig.prototype.overlayCidr = "";

            /**
             * NetworkConfig serverAddress.
             * @member {string} serverAddress
             * @memberof router.manager.NetworkConfig
             * @instance
             */
            NetworkConfig.prototype.serverAddress = "";

            /**
             * NetworkConfig mtu.
             * @member {number} mtu
             * @memberof router.manager.NetworkConfig
             * @instance
             */
            NetworkConfig.prototype.mtu = 0;

            /**
             * NetworkConfig publicHost.
             * @member {string} publicHost
             * @memberof router.manager.NetworkConfig
             * @instance
             */
            NetworkConfig.prototype.publicHost = "";

            /**
             * NetworkConfig listenPort.
             * @member {number} listenPort
             * @memberof router.manager.NetworkConfig
             * @instance
             */
            NetworkConfig.prototype.listenPort = 0;

            /**
             * Creates a new NetworkConfig instance using the specified properties.
             * @function create
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {router.manager.INetworkConfig=} [properties] Properties to set
             * @returns {router.manager.NetworkConfig} NetworkConfig instance
             */
            NetworkConfig.create = function create(properties) {
                return new NetworkConfig(properties);
            };

            /**
             * Encodes the specified NetworkConfig message. Does not implicitly {@link router.manager.NetworkConfig.verify|verify} messages.
             * @function encode
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {router.manager.INetworkConfig} message NetworkConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NetworkConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.overlayCidr != null && Object.hasOwnProperty.call(message, "overlayCidr"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.overlayCidr);
                if (message.serverAddress != null && Object.hasOwnProperty.call(message, "serverAddress"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.serverAddress);
                if (message.mtu != null && Object.hasOwnProperty.call(message, "mtu"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.mtu);
                if (message.publicHost != null && Object.hasOwnProperty.call(message, "publicHost"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.publicHost);
                if (message.listenPort != null && Object.hasOwnProperty.call(message, "listenPort"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.listenPort);
                return writer;
            };

            /**
             * Encodes the specified NetworkConfig message, length delimited. Does not implicitly {@link router.manager.NetworkConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {router.manager.INetworkConfig} message NetworkConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NetworkConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NetworkConfig message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.NetworkConfig} NetworkConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NetworkConfig.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.NetworkConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.overlayCidr = reader.string();
                            break;
                        }
                    case 2: {
                            message.serverAddress = reader.string();
                            break;
                        }
                    case 3: {
                            message.mtu = reader.uint32();
                            break;
                        }
                    case 4: {
                            message.publicHost = reader.string();
                            break;
                        }
                    case 5: {
                            message.listenPort = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NetworkConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.NetworkConfig} NetworkConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NetworkConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NetworkConfig message.
             * @function verify
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NetworkConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.overlayCidr != null && message.hasOwnProperty("overlayCidr"))
                    if (!$util.isString(message.overlayCidr))
                        return "overlayCidr: string expected";
                if (message.serverAddress != null && message.hasOwnProperty("serverAddress"))
                    if (!$util.isString(message.serverAddress))
                        return "serverAddress: string expected";
                if (message.mtu != null && message.hasOwnProperty("mtu"))
                    if (!$util.isInteger(message.mtu))
                        return "mtu: integer expected";
                if (message.publicHost != null && message.hasOwnProperty("publicHost"))
                    if (!$util.isString(message.publicHost))
                        return "publicHost: string expected";
                if (message.listenPort != null && message.hasOwnProperty("listenPort"))
                    if (!$util.isInteger(message.listenPort))
                        return "listenPort: integer expected";
                return null;
            };

            /**
             * Creates a NetworkConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.NetworkConfig} NetworkConfig
             */
            NetworkConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.NetworkConfig)
                    return object;
                var message = new $root.router.manager.NetworkConfig();
                if (object.overlayCidr != null)
                    message.overlayCidr = String(object.overlayCidr);
                if (object.serverAddress != null)
                    message.serverAddress = String(object.serverAddress);
                if (object.mtu != null)
                    message.mtu = object.mtu >>> 0;
                if (object.publicHost != null)
                    message.publicHost = String(object.publicHost);
                if (object.listenPort != null)
                    message.listenPort = object.listenPort >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a NetworkConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {router.manager.NetworkConfig} message NetworkConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NetworkConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.overlayCidr = "";
                    object.serverAddress = "";
                    object.mtu = 0;
                    object.publicHost = "";
                    object.listenPort = 0;
                }
                if (message.overlayCidr != null && message.hasOwnProperty("overlayCidr"))
                    object.overlayCidr = message.overlayCidr;
                if (message.serverAddress != null && message.hasOwnProperty("serverAddress"))
                    object.serverAddress = message.serverAddress;
                if (message.mtu != null && message.hasOwnProperty("mtu"))
                    object.mtu = message.mtu;
                if (message.publicHost != null && message.hasOwnProperty("publicHost"))
                    object.publicHost = message.publicHost;
                if (message.listenPort != null && message.hasOwnProperty("listenPort"))
                    object.listenPort = message.listenPort;
                return object;
            };

            /**
             * Converts this NetworkConfig to JSON.
             * @function toJSON
             * @memberof router.manager.NetworkConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NetworkConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for NetworkConfig
             * @function getTypeUrl
             * @memberof router.manager.NetworkConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            NetworkConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.NetworkConfig";
            };

            return NetworkConfig;
        })();

        manager.Peer = (function() {

            /**
             * Properties of a Peer.
             * @memberof router.manager
             * @interface IPeer
             * @property {string|null} [id] Peer id
             * @property {string|null} [name] Peer name
             * @property {Array.<string>|null} [internalIps] Peer internalIps
             * @property {router.manager.IWireGuardPeerConfig|null} [wireguard] Peer wireguard
             * @property {router.manager.IPeerStatus|null} [status] Peer status
             */

            /**
             * Constructs a new Peer.
             * @memberof router.manager
             * @classdesc Represents a Peer.
             * @implements IPeer
             * @constructor
             * @param {router.manager.IPeer=} [properties] Properties to set
             */
            function Peer(properties) {
                this.internalIps = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Peer id.
             * @member {string} id
             * @memberof router.manager.Peer
             * @instance
             */
            Peer.prototype.id = "";

            /**
             * Peer name.
             * @member {string} name
             * @memberof router.manager.Peer
             * @instance
             */
            Peer.prototype.name = "";

            /**
             * Peer internalIps.
             * @member {Array.<string>} internalIps
             * @memberof router.manager.Peer
             * @instance
             */
            Peer.prototype.internalIps = $util.emptyArray;

            /**
             * Peer wireguard.
             * @member {router.manager.IWireGuardPeerConfig|null|undefined} wireguard
             * @memberof router.manager.Peer
             * @instance
             */
            Peer.prototype.wireguard = null;

            /**
             * Peer status.
             * @member {router.manager.IPeerStatus|null|undefined} status
             * @memberof router.manager.Peer
             * @instance
             */
            Peer.prototype.status = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * Peer protocolData.
             * @member {"wireguard"|undefined} protocolData
             * @memberof router.manager.Peer
             * @instance
             */
            Object.defineProperty(Peer.prototype, "protocolData", {
                get: $util.oneOfGetter($oneOfFields = ["wireguard"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Peer instance using the specified properties.
             * @function create
             * @memberof router.manager.Peer
             * @static
             * @param {router.manager.IPeer=} [properties] Properties to set
             * @returns {router.manager.Peer} Peer instance
             */
            Peer.create = function create(properties) {
                return new Peer(properties);
            };

            /**
             * Encodes the specified Peer message. Does not implicitly {@link router.manager.Peer.verify|verify} messages.
             * @function encode
             * @memberof router.manager.Peer
             * @static
             * @param {router.manager.IPeer} message Peer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Peer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.internalIps != null && message.internalIps.length)
                    for (var i = 0; i < message.internalIps.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.internalIps[i]);
                if (message.wireguard != null && Object.hasOwnProperty.call(message, "wireguard"))
                    $root.router.manager.WireGuardPeerConfig.encode(message.wireguard, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    $root.router.manager.PeerStatus.encode(message.status, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Peer message, length delimited. Does not implicitly {@link router.manager.Peer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.Peer
             * @static
             * @param {router.manager.IPeer} message Peer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Peer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Peer message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.Peer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.Peer} Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Peer.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.Peer();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            if (!(message.internalIps && message.internalIps.length))
                                message.internalIps = [];
                            message.internalIps.push(reader.string());
                            break;
                        }
                    case 10: {
                            message.wireguard = $root.router.manager.WireGuardPeerConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 20: {
                            message.status = $root.router.manager.PeerStatus.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Peer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.Peer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.Peer} Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Peer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Peer message.
             * @function verify
             * @memberof router.manager.Peer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Peer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.internalIps != null && message.hasOwnProperty("internalIps")) {
                    if (!Array.isArray(message.internalIps))
                        return "internalIps: array expected";
                    for (var i = 0; i < message.internalIps.length; ++i)
                        if (!$util.isString(message.internalIps[i]))
                            return "internalIps: string[] expected";
                }
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    properties.protocolData = 1;
                    {
                        var error = $root.router.manager.WireGuardPeerConfig.verify(message.wireguard);
                        if (error)
                            return "wireguard." + error;
                    }
                }
                if (message.status != null && message.hasOwnProperty("status")) {
                    var error = $root.router.manager.PeerStatus.verify(message.status);
                    if (error)
                        return "status." + error;
                }
                return null;
            };

            /**
             * Creates a Peer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.Peer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.Peer} Peer
             */
            Peer.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.Peer)
                    return object;
                var message = new $root.router.manager.Peer();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.internalIps) {
                    if (!Array.isArray(object.internalIps))
                        throw TypeError(".router.manager.Peer.internalIps: array expected");
                    message.internalIps = [];
                    for (var i = 0; i < object.internalIps.length; ++i)
                        message.internalIps[i] = String(object.internalIps[i]);
                }
                if (object.wireguard != null) {
                    if (typeof object.wireguard !== "object")
                        throw TypeError(".router.manager.Peer.wireguard: object expected");
                    message.wireguard = $root.router.manager.WireGuardPeerConfig.fromObject(object.wireguard);
                }
                if (object.status != null) {
                    if (typeof object.status !== "object")
                        throw TypeError(".router.manager.Peer.status: object expected");
                    message.status = $root.router.manager.PeerStatus.fromObject(object.status);
                }
                return message;
            };

            /**
             * Creates a plain object from a Peer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.Peer
             * @static
             * @param {router.manager.Peer} message Peer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Peer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.internalIps = [];
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.status = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.internalIps && message.internalIps.length) {
                    object.internalIps = [];
                    for (var j = 0; j < message.internalIps.length; ++j)
                        object.internalIps[j] = message.internalIps[j];
                }
                if (message.wireguard != null && message.hasOwnProperty("wireguard")) {
                    object.wireguard = $root.router.manager.WireGuardPeerConfig.toObject(message.wireguard, options);
                    if (options.oneofs)
                        object.protocolData = "wireguard";
                }
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = $root.router.manager.PeerStatus.toObject(message.status, options);
                return object;
            };

            /**
             * Converts this Peer to JSON.
             * @function toJSON
             * @memberof router.manager.Peer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Peer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Peer
             * @function getTypeUrl
             * @memberof router.manager.Peer
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Peer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.Peer";
            };

            return Peer;
        })();

        manager.PeerStatus = (function() {

            /**
             * Properties of a PeerStatus.
             * @memberof router.manager
             * @interface IPeerStatus
             * @property {boolean|null} [isActive] PeerStatus isActive
             * @property {string|null} [lastEndpoint] PeerStatus lastEndpoint
             * @property {google.protobuf.ITimestamp|null} [lastSeen] PeerStatus lastSeen
             * @property {number|Long|null} [rxBytes] PeerStatus rxBytes
             * @property {number|Long|null} [txBytes] PeerStatus txBytes
             */

            /**
             * Constructs a new PeerStatus.
             * @memberof router.manager
             * @classdesc Represents a PeerStatus.
             * @implements IPeerStatus
             * @constructor
             * @param {router.manager.IPeerStatus=} [properties] Properties to set
             */
            function PeerStatus(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PeerStatus isActive.
             * @member {boolean} isActive
             * @memberof router.manager.PeerStatus
             * @instance
             */
            PeerStatus.prototype.isActive = false;

            /**
             * PeerStatus lastEndpoint.
             * @member {string|null|undefined} lastEndpoint
             * @memberof router.manager.PeerStatus
             * @instance
             */
            PeerStatus.prototype.lastEndpoint = null;

            /**
             * PeerStatus lastSeen.
             * @member {google.protobuf.ITimestamp|null|undefined} lastSeen
             * @memberof router.manager.PeerStatus
             * @instance
             */
            PeerStatus.prototype.lastSeen = null;

            /**
             * PeerStatus rxBytes.
             * @member {number|Long} rxBytes
             * @memberof router.manager.PeerStatus
             * @instance
             */
            PeerStatus.prototype.rxBytes = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * PeerStatus txBytes.
             * @member {number|Long} txBytes
             * @memberof router.manager.PeerStatus
             * @instance
             */
            PeerStatus.prototype.txBytes = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(PeerStatus.prototype, "_lastEndpoint", {
                get: $util.oneOfGetter($oneOfFields = ["lastEndpoint"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(PeerStatus.prototype, "_lastSeen", {
                get: $util.oneOfGetter($oneOfFields = ["lastSeen"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new PeerStatus instance using the specified properties.
             * @function create
             * @memberof router.manager.PeerStatus
             * @static
             * @param {router.manager.IPeerStatus=} [properties] Properties to set
             * @returns {router.manager.PeerStatus} PeerStatus instance
             */
            PeerStatus.create = function create(properties) {
                return new PeerStatus(properties);
            };

            /**
             * Encodes the specified PeerStatus message. Does not implicitly {@link router.manager.PeerStatus.verify|verify} messages.
             * @function encode
             * @memberof router.manager.PeerStatus
             * @static
             * @param {router.manager.IPeerStatus} message PeerStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerStatus.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.isActive != null && Object.hasOwnProperty.call(message, "isActive"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.isActive);
                if (message.lastEndpoint != null && Object.hasOwnProperty.call(message, "lastEndpoint"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.lastEndpoint);
                if (message.lastSeen != null && Object.hasOwnProperty.call(message, "lastSeen"))
                    $root.google.protobuf.Timestamp.encode(message.lastSeen, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.rxBytes != null && Object.hasOwnProperty.call(message, "rxBytes"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.rxBytes);
                if (message.txBytes != null && Object.hasOwnProperty.call(message, "txBytes"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.txBytes);
                return writer;
            };

            /**
             * Encodes the specified PeerStatus message, length delimited. Does not implicitly {@link router.manager.PeerStatus.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.PeerStatus
             * @static
             * @param {router.manager.IPeerStatus} message PeerStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerStatus.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PeerStatus message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.PeerStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.PeerStatus} PeerStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerStatus.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.PeerStatus();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.isActive = reader.bool();
                            break;
                        }
                    case 2: {
                            message.lastEndpoint = reader.string();
                            break;
                        }
                    case 3: {
                            message.lastSeen = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.rxBytes = reader.uint64();
                            break;
                        }
                    case 5: {
                            message.txBytes = reader.uint64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PeerStatus message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.PeerStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.PeerStatus} PeerStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerStatus.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PeerStatus message.
             * @function verify
             * @memberof router.manager.PeerStatus
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PeerStatus.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.isActive != null && message.hasOwnProperty("isActive"))
                    if (typeof message.isActive !== "boolean")
                        return "isActive: boolean expected";
                if (message.lastEndpoint != null && message.hasOwnProperty("lastEndpoint")) {
                    properties._lastEndpoint = 1;
                    if (!$util.isString(message.lastEndpoint))
                        return "lastEndpoint: string expected";
                }
                if (message.lastSeen != null && message.hasOwnProperty("lastSeen")) {
                    properties._lastSeen = 1;
                    {
                        var error = $root.google.protobuf.Timestamp.verify(message.lastSeen);
                        if (error)
                            return "lastSeen." + error;
                    }
                }
                if (message.rxBytes != null && message.hasOwnProperty("rxBytes"))
                    if (!$util.isInteger(message.rxBytes) && !(message.rxBytes && $util.isInteger(message.rxBytes.low) && $util.isInteger(message.rxBytes.high)))
                        return "rxBytes: integer|Long expected";
                if (message.txBytes != null && message.hasOwnProperty("txBytes"))
                    if (!$util.isInteger(message.txBytes) && !(message.txBytes && $util.isInteger(message.txBytes.low) && $util.isInteger(message.txBytes.high)))
                        return "txBytes: integer|Long expected";
                return null;
            };

            /**
             * Creates a PeerStatus message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.PeerStatus
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.PeerStatus} PeerStatus
             */
            PeerStatus.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.PeerStatus)
                    return object;
                var message = new $root.router.manager.PeerStatus();
                if (object.isActive != null)
                    message.isActive = Boolean(object.isActive);
                if (object.lastEndpoint != null)
                    message.lastEndpoint = String(object.lastEndpoint);
                if (object.lastSeen != null) {
                    if (typeof object.lastSeen !== "object")
                        throw TypeError(".router.manager.PeerStatus.lastSeen: object expected");
                    message.lastSeen = $root.google.protobuf.Timestamp.fromObject(object.lastSeen);
                }
                if (object.rxBytes != null)
                    if ($util.Long)
                        (message.rxBytes = $util.Long.fromValue(object.rxBytes)).unsigned = true;
                    else if (typeof object.rxBytes === "string")
                        message.rxBytes = parseInt(object.rxBytes, 10);
                    else if (typeof object.rxBytes === "number")
                        message.rxBytes = object.rxBytes;
                    else if (typeof object.rxBytes === "object")
                        message.rxBytes = new $util.LongBits(object.rxBytes.low >>> 0, object.rxBytes.high >>> 0).toNumber(true);
                if (object.txBytes != null)
                    if ($util.Long)
                        (message.txBytes = $util.Long.fromValue(object.txBytes)).unsigned = true;
                    else if (typeof object.txBytes === "string")
                        message.txBytes = parseInt(object.txBytes, 10);
                    else if (typeof object.txBytes === "number")
                        message.txBytes = object.txBytes;
                    else if (typeof object.txBytes === "object")
                        message.txBytes = new $util.LongBits(object.txBytes.low >>> 0, object.txBytes.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a PeerStatus message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.PeerStatus
             * @static
             * @param {router.manager.PeerStatus} message PeerStatus
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PeerStatus.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.isActive = false;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.rxBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.rxBytes = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.txBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.txBytes = options.longs === String ? "0" : 0;
                }
                if (message.isActive != null && message.hasOwnProperty("isActive"))
                    object.isActive = message.isActive;
                if (message.lastEndpoint != null && message.hasOwnProperty("lastEndpoint")) {
                    object.lastEndpoint = message.lastEndpoint;
                    if (options.oneofs)
                        object._lastEndpoint = "lastEndpoint";
                }
                if (message.lastSeen != null && message.hasOwnProperty("lastSeen")) {
                    object.lastSeen = $root.google.protobuf.Timestamp.toObject(message.lastSeen, options);
                    if (options.oneofs)
                        object._lastSeen = "lastSeen";
                }
                if (message.rxBytes != null && message.hasOwnProperty("rxBytes"))
                    if (typeof message.rxBytes === "number")
                        object.rxBytes = options.longs === String ? String(message.rxBytes) : message.rxBytes;
                    else
                        object.rxBytes = options.longs === String ? $util.Long.prototype.toString.call(message.rxBytes) : options.longs === Number ? new $util.LongBits(message.rxBytes.low >>> 0, message.rxBytes.high >>> 0).toNumber(true) : message.rxBytes;
                if (message.txBytes != null && message.hasOwnProperty("txBytes"))
                    if (typeof message.txBytes === "number")
                        object.txBytes = options.longs === String ? String(message.txBytes) : message.txBytes;
                    else
                        object.txBytes = options.longs === String ? $util.Long.prototype.toString.call(message.txBytes) : options.longs === Number ? new $util.LongBits(message.txBytes.low >>> 0, message.txBytes.high >>> 0).toNumber(true) : message.txBytes;
                return object;
            };

            /**
             * Converts this PeerStatus to JSON.
             * @function toJSON
             * @memberof router.manager.PeerStatus
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PeerStatus.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PeerStatus
             * @function getTypeUrl
             * @memberof router.manager.PeerStatus
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PeerStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.PeerStatus";
            };

            return PeerStatus;
        })();

        manager.Event = (function() {

            /**
             * Properties of an Event.
             * @memberof router.manager
             * @interface IEvent
             * @property {google.protobuf.ITimestamp|null} [timestamp] Event timestamp
             * @property {string|null} [peerId] Event peerId
             * @property {router.manager.IPeerConnected|null} [connected] Event connected
             * @property {router.manager.IPeerDisconnected|null} [disconnected] Event disconnected
             * @property {router.manager.ITrafficUpdate|null} [traffic] Event traffic
             * @property {router.manager.IProtocolSpecificEvent|null} [protocol] Event protocol
             */

            /**
             * Constructs a new Event.
             * @memberof router.manager
             * @classdesc Represents an Event.
             * @implements IEvent
             * @constructor
             * @param {router.manager.IEvent=} [properties] Properties to set
             */
            function Event(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Event timestamp.
             * @member {google.protobuf.ITimestamp|null|undefined} timestamp
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.timestamp = null;

            /**
             * Event peerId.
             * @member {string} peerId
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.peerId = "";

            /**
             * Event connected.
             * @member {router.manager.IPeerConnected|null|undefined} connected
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.connected = null;

            /**
             * Event disconnected.
             * @member {router.manager.IPeerDisconnected|null|undefined} disconnected
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.disconnected = null;

            /**
             * Event traffic.
             * @member {router.manager.ITrafficUpdate|null|undefined} traffic
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.traffic = null;

            /**
             * Event protocol.
             * @member {router.manager.IProtocolSpecificEvent|null|undefined} protocol
             * @memberof router.manager.Event
             * @instance
             */
            Event.prototype.protocol = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * Event eventType.
             * @member {"connected"|"disconnected"|"traffic"|"protocol"|undefined} eventType
             * @memberof router.manager.Event
             * @instance
             */
            Object.defineProperty(Event.prototype, "eventType", {
                get: $util.oneOfGetter($oneOfFields = ["connected", "disconnected", "traffic", "protocol"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Event instance using the specified properties.
             * @function create
             * @memberof router.manager.Event
             * @static
             * @param {router.manager.IEvent=} [properties] Properties to set
             * @returns {router.manager.Event} Event instance
             */
            Event.create = function create(properties) {
                return new Event(properties);
            };

            /**
             * Encodes the specified Event message. Does not implicitly {@link router.manager.Event.verify|verify} messages.
             * @function encode
             * @memberof router.manager.Event
             * @static
             * @param {router.manager.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                    $root.google.protobuf.Timestamp.encode(message.timestamp, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.peerId != null && Object.hasOwnProperty.call(message, "peerId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.peerId);
                if (message.connected != null && Object.hasOwnProperty.call(message, "connected"))
                    $root.router.manager.PeerConnected.encode(message.connected, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.disconnected != null && Object.hasOwnProperty.call(message, "disconnected"))
                    $root.router.manager.PeerDisconnected.encode(message.disconnected, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.traffic != null && Object.hasOwnProperty.call(message, "traffic"))
                    $root.router.manager.TrafficUpdate.encode(message.traffic, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.protocol != null && Object.hasOwnProperty.call(message, "protocol"))
                    $root.router.manager.ProtocolSpecificEvent.encode(message.protocol, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Event message, length delimited. Does not implicitly {@link router.manager.Event.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.Event
             * @static
             * @param {router.manager.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Event message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.Event();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.timestamp = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.peerId = reader.string();
                            break;
                        }
                    case 3: {
                            message.connected = $root.router.manager.PeerConnected.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.disconnected = $root.router.manager.PeerDisconnected.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.traffic = $root.router.manager.TrafficUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.protocol = $root.router.manager.ProtocolSpecificEvent.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Event message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Event message.
             * @function verify
             * @memberof router.manager.Event
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Event.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
                    var error = $root.google.protobuf.Timestamp.verify(message.timestamp);
                    if (error)
                        return "timestamp." + error;
                }
                if (message.peerId != null && message.hasOwnProperty("peerId"))
                    if (!$util.isString(message.peerId))
                        return "peerId: string expected";
                if (message.connected != null && message.hasOwnProperty("connected")) {
                    properties.eventType = 1;
                    {
                        var error = $root.router.manager.PeerConnected.verify(message.connected);
                        if (error)
                            return "connected." + error;
                    }
                }
                if (message.disconnected != null && message.hasOwnProperty("disconnected")) {
                    if (properties.eventType === 1)
                        return "eventType: multiple values";
                    properties.eventType = 1;
                    {
                        var error = $root.router.manager.PeerDisconnected.verify(message.disconnected);
                        if (error)
                            return "disconnected." + error;
                    }
                }
                if (message.traffic != null && message.hasOwnProperty("traffic")) {
                    if (properties.eventType === 1)
                        return "eventType: multiple values";
                    properties.eventType = 1;
                    {
                        var error = $root.router.manager.TrafficUpdate.verify(message.traffic);
                        if (error)
                            return "traffic." + error;
                    }
                }
                if (message.protocol != null && message.hasOwnProperty("protocol")) {
                    if (properties.eventType === 1)
                        return "eventType: multiple values";
                    properties.eventType = 1;
                    {
                        var error = $root.router.manager.ProtocolSpecificEvent.verify(message.protocol);
                        if (error)
                            return "protocol." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an Event message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.Event
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.Event} Event
             */
            Event.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.Event)
                    return object;
                var message = new $root.router.manager.Event();
                if (object.timestamp != null) {
                    if (typeof object.timestamp !== "object")
                        throw TypeError(".router.manager.Event.timestamp: object expected");
                    message.timestamp = $root.google.protobuf.Timestamp.fromObject(object.timestamp);
                }
                if (object.peerId != null)
                    message.peerId = String(object.peerId);
                if (object.connected != null) {
                    if (typeof object.connected !== "object")
                        throw TypeError(".router.manager.Event.connected: object expected");
                    message.connected = $root.router.manager.PeerConnected.fromObject(object.connected);
                }
                if (object.disconnected != null) {
                    if (typeof object.disconnected !== "object")
                        throw TypeError(".router.manager.Event.disconnected: object expected");
                    message.disconnected = $root.router.manager.PeerDisconnected.fromObject(object.disconnected);
                }
                if (object.traffic != null) {
                    if (typeof object.traffic !== "object")
                        throw TypeError(".router.manager.Event.traffic: object expected");
                    message.traffic = $root.router.manager.TrafficUpdate.fromObject(object.traffic);
                }
                if (object.protocol != null) {
                    if (typeof object.protocol !== "object")
                        throw TypeError(".router.manager.Event.protocol: object expected");
                    message.protocol = $root.router.manager.ProtocolSpecificEvent.fromObject(object.protocol);
                }
                return message;
            };

            /**
             * Creates a plain object from an Event message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.Event
             * @static
             * @param {router.manager.Event} message Event
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Event.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.timestamp = null;
                    object.peerId = "";
                }
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    object.timestamp = $root.google.protobuf.Timestamp.toObject(message.timestamp, options);
                if (message.peerId != null && message.hasOwnProperty("peerId"))
                    object.peerId = message.peerId;
                if (message.connected != null && message.hasOwnProperty("connected")) {
                    object.connected = $root.router.manager.PeerConnected.toObject(message.connected, options);
                    if (options.oneofs)
                        object.eventType = "connected";
                }
                if (message.disconnected != null && message.hasOwnProperty("disconnected")) {
                    object.disconnected = $root.router.manager.PeerDisconnected.toObject(message.disconnected, options);
                    if (options.oneofs)
                        object.eventType = "disconnected";
                }
                if (message.traffic != null && message.hasOwnProperty("traffic")) {
                    object.traffic = $root.router.manager.TrafficUpdate.toObject(message.traffic, options);
                    if (options.oneofs)
                        object.eventType = "traffic";
                }
                if (message.protocol != null && message.hasOwnProperty("protocol")) {
                    object.protocol = $root.router.manager.ProtocolSpecificEvent.toObject(message.protocol, options);
                    if (options.oneofs)
                        object.eventType = "protocol";
                }
                return object;
            };

            /**
             * Converts this Event to JSON.
             * @function toJSON
             * @memberof router.manager.Event
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Event.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Event
             * @function getTypeUrl
             * @memberof router.manager.Event
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.Event";
            };

            return Event;
        })();

        manager.PeerConnected = (function() {

            /**
             * Properties of a PeerConnected.
             * @memberof router.manager
             * @interface IPeerConnected
             * @property {string|null} [endpoint] PeerConnected endpoint
             */

            /**
             * Constructs a new PeerConnected.
             * @memberof router.manager
             * @classdesc Represents a PeerConnected.
             * @implements IPeerConnected
             * @constructor
             * @param {router.manager.IPeerConnected=} [properties] Properties to set
             */
            function PeerConnected(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PeerConnected endpoint.
             * @member {string} endpoint
             * @memberof router.manager.PeerConnected
             * @instance
             */
            PeerConnected.prototype.endpoint = "";

            /**
             * Creates a new PeerConnected instance using the specified properties.
             * @function create
             * @memberof router.manager.PeerConnected
             * @static
             * @param {router.manager.IPeerConnected=} [properties] Properties to set
             * @returns {router.manager.PeerConnected} PeerConnected instance
             */
            PeerConnected.create = function create(properties) {
                return new PeerConnected(properties);
            };

            /**
             * Encodes the specified PeerConnected message. Does not implicitly {@link router.manager.PeerConnected.verify|verify} messages.
             * @function encode
             * @memberof router.manager.PeerConnected
             * @static
             * @param {router.manager.IPeerConnected} message PeerConnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerConnected.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.endpoint != null && Object.hasOwnProperty.call(message, "endpoint"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.endpoint);
                return writer;
            };

            /**
             * Encodes the specified PeerConnected message, length delimited. Does not implicitly {@link router.manager.PeerConnected.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.PeerConnected
             * @static
             * @param {router.manager.IPeerConnected} message PeerConnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerConnected.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PeerConnected message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.PeerConnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.PeerConnected} PeerConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerConnected.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.PeerConnected();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.endpoint = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PeerConnected message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.PeerConnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.PeerConnected} PeerConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerConnected.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PeerConnected message.
             * @function verify
             * @memberof router.manager.PeerConnected
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PeerConnected.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.endpoint != null && message.hasOwnProperty("endpoint"))
                    if (!$util.isString(message.endpoint))
                        return "endpoint: string expected";
                return null;
            };

            /**
             * Creates a PeerConnected message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.PeerConnected
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.PeerConnected} PeerConnected
             */
            PeerConnected.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.PeerConnected)
                    return object;
                var message = new $root.router.manager.PeerConnected();
                if (object.endpoint != null)
                    message.endpoint = String(object.endpoint);
                return message;
            };

            /**
             * Creates a plain object from a PeerConnected message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.PeerConnected
             * @static
             * @param {router.manager.PeerConnected} message PeerConnected
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PeerConnected.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.endpoint = "";
                if (message.endpoint != null && message.hasOwnProperty("endpoint"))
                    object.endpoint = message.endpoint;
                return object;
            };

            /**
             * Converts this PeerConnected to JSON.
             * @function toJSON
             * @memberof router.manager.PeerConnected
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PeerConnected.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PeerConnected
             * @function getTypeUrl
             * @memberof router.manager.PeerConnected
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PeerConnected.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.PeerConnected";
            };

            return PeerConnected;
        })();

        manager.PeerDisconnected = (function() {

            /**
             * Properties of a PeerDisconnected.
             * @memberof router.manager
             * @interface IPeerDisconnected
             */

            /**
             * Constructs a new PeerDisconnected.
             * @memberof router.manager
             * @classdesc Represents a PeerDisconnected.
             * @implements IPeerDisconnected
             * @constructor
             * @param {router.manager.IPeerDisconnected=} [properties] Properties to set
             */
            function PeerDisconnected(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new PeerDisconnected instance using the specified properties.
             * @function create
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {router.manager.IPeerDisconnected=} [properties] Properties to set
             * @returns {router.manager.PeerDisconnected} PeerDisconnected instance
             */
            PeerDisconnected.create = function create(properties) {
                return new PeerDisconnected(properties);
            };

            /**
             * Encodes the specified PeerDisconnected message. Does not implicitly {@link router.manager.PeerDisconnected.verify|verify} messages.
             * @function encode
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {router.manager.IPeerDisconnected} message PeerDisconnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerDisconnected.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified PeerDisconnected message, length delimited. Does not implicitly {@link router.manager.PeerDisconnected.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {router.manager.IPeerDisconnected} message PeerDisconnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PeerDisconnected.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PeerDisconnected message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.PeerDisconnected} PeerDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerDisconnected.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.PeerDisconnected();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PeerDisconnected message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.PeerDisconnected} PeerDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PeerDisconnected.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PeerDisconnected message.
             * @function verify
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PeerDisconnected.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates a PeerDisconnected message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.PeerDisconnected} PeerDisconnected
             */
            PeerDisconnected.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.PeerDisconnected)
                    return object;
                return new $root.router.manager.PeerDisconnected();
            };

            /**
             * Creates a plain object from a PeerDisconnected message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {router.manager.PeerDisconnected} message PeerDisconnected
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PeerDisconnected.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this PeerDisconnected to JSON.
             * @function toJSON
             * @memberof router.manager.PeerDisconnected
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PeerDisconnected.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PeerDisconnected
             * @function getTypeUrl
             * @memberof router.manager.PeerDisconnected
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PeerDisconnected.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.PeerDisconnected";
            };

            return PeerDisconnected;
        })();

        manager.TrafficUpdate = (function() {

            /**
             * Properties of a TrafficUpdate.
             * @memberof router.manager
             * @interface ITrafficUpdate
             * @property {number|Long|null} [rxBytes] TrafficUpdate rxBytes
             * @property {number|Long|null} [txBytes] TrafficUpdate txBytes
             */

            /**
             * Constructs a new TrafficUpdate.
             * @memberof router.manager
             * @classdesc Represents a TrafficUpdate.
             * @implements ITrafficUpdate
             * @constructor
             * @param {router.manager.ITrafficUpdate=} [properties] Properties to set
             */
            function TrafficUpdate(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TrafficUpdate rxBytes.
             * @member {number|Long} rxBytes
             * @memberof router.manager.TrafficUpdate
             * @instance
             */
            TrafficUpdate.prototype.rxBytes = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * TrafficUpdate txBytes.
             * @member {number|Long} txBytes
             * @memberof router.manager.TrafficUpdate
             * @instance
             */
            TrafficUpdate.prototype.txBytes = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new TrafficUpdate instance using the specified properties.
             * @function create
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {router.manager.ITrafficUpdate=} [properties] Properties to set
             * @returns {router.manager.TrafficUpdate} TrafficUpdate instance
             */
            TrafficUpdate.create = function create(properties) {
                return new TrafficUpdate(properties);
            };

            /**
             * Encodes the specified TrafficUpdate message. Does not implicitly {@link router.manager.TrafficUpdate.verify|verify} messages.
             * @function encode
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {router.manager.ITrafficUpdate} message TrafficUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TrafficUpdate.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.rxBytes != null && Object.hasOwnProperty.call(message, "rxBytes"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.rxBytes);
                if (message.txBytes != null && Object.hasOwnProperty.call(message, "txBytes"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.txBytes);
                return writer;
            };

            /**
             * Encodes the specified TrafficUpdate message, length delimited. Does not implicitly {@link router.manager.TrafficUpdate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {router.manager.ITrafficUpdate} message TrafficUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TrafficUpdate.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TrafficUpdate message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.TrafficUpdate} TrafficUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TrafficUpdate.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.TrafficUpdate();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.rxBytes = reader.uint64();
                            break;
                        }
                    case 2: {
                            message.txBytes = reader.uint64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a TrafficUpdate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.TrafficUpdate} TrafficUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TrafficUpdate.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TrafficUpdate message.
             * @function verify
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TrafficUpdate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.rxBytes != null && message.hasOwnProperty("rxBytes"))
                    if (!$util.isInteger(message.rxBytes) && !(message.rxBytes && $util.isInteger(message.rxBytes.low) && $util.isInteger(message.rxBytes.high)))
                        return "rxBytes: integer|Long expected";
                if (message.txBytes != null && message.hasOwnProperty("txBytes"))
                    if (!$util.isInteger(message.txBytes) && !(message.txBytes && $util.isInteger(message.txBytes.low) && $util.isInteger(message.txBytes.high)))
                        return "txBytes: integer|Long expected";
                return null;
            };

            /**
             * Creates a TrafficUpdate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.TrafficUpdate} TrafficUpdate
             */
            TrafficUpdate.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.TrafficUpdate)
                    return object;
                var message = new $root.router.manager.TrafficUpdate();
                if (object.rxBytes != null)
                    if ($util.Long)
                        (message.rxBytes = $util.Long.fromValue(object.rxBytes)).unsigned = true;
                    else if (typeof object.rxBytes === "string")
                        message.rxBytes = parseInt(object.rxBytes, 10);
                    else if (typeof object.rxBytes === "number")
                        message.rxBytes = object.rxBytes;
                    else if (typeof object.rxBytes === "object")
                        message.rxBytes = new $util.LongBits(object.rxBytes.low >>> 0, object.rxBytes.high >>> 0).toNumber(true);
                if (object.txBytes != null)
                    if ($util.Long)
                        (message.txBytes = $util.Long.fromValue(object.txBytes)).unsigned = true;
                    else if (typeof object.txBytes === "string")
                        message.txBytes = parseInt(object.txBytes, 10);
                    else if (typeof object.txBytes === "number")
                        message.txBytes = object.txBytes;
                    else if (typeof object.txBytes === "object")
                        message.txBytes = new $util.LongBits(object.txBytes.low >>> 0, object.txBytes.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a TrafficUpdate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {router.manager.TrafficUpdate} message TrafficUpdate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TrafficUpdate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.rxBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.rxBytes = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.txBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.txBytes = options.longs === String ? "0" : 0;
                }
                if (message.rxBytes != null && message.hasOwnProperty("rxBytes"))
                    if (typeof message.rxBytes === "number")
                        object.rxBytes = options.longs === String ? String(message.rxBytes) : message.rxBytes;
                    else
                        object.rxBytes = options.longs === String ? $util.Long.prototype.toString.call(message.rxBytes) : options.longs === Number ? new $util.LongBits(message.rxBytes.low >>> 0, message.rxBytes.high >>> 0).toNumber(true) : message.rxBytes;
                if (message.txBytes != null && message.hasOwnProperty("txBytes"))
                    if (typeof message.txBytes === "number")
                        object.txBytes = options.longs === String ? String(message.txBytes) : message.txBytes;
                    else
                        object.txBytes = options.longs === String ? $util.Long.prototype.toString.call(message.txBytes) : options.longs === Number ? new $util.LongBits(message.txBytes.low >>> 0, message.txBytes.high >>> 0).toNumber(true) : message.txBytes;
                return object;
            };

            /**
             * Converts this TrafficUpdate to JSON.
             * @function toJSON
             * @memberof router.manager.TrafficUpdate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TrafficUpdate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TrafficUpdate
             * @function getTypeUrl
             * @memberof router.manager.TrafficUpdate
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TrafficUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.TrafficUpdate";
            };

            return TrafficUpdate;
        })();

        manager.WireGuardGlobalState = (function() {

            /**
             * Properties of a WireGuardGlobalState.
             * @memberof router.manager
             * @interface IWireGuardGlobalState
             * @property {string|null} [publicKey] WireGuardGlobalState publicKey
             */

            /**
             * Constructs a new WireGuardGlobalState.
             * @memberof router.manager
             * @classdesc Represents a WireGuardGlobalState.
             * @implements IWireGuardGlobalState
             * @constructor
             * @param {router.manager.IWireGuardGlobalState=} [properties] Properties to set
             */
            function WireGuardGlobalState(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WireGuardGlobalState publicKey.
             * @member {string} publicKey
             * @memberof router.manager.WireGuardGlobalState
             * @instance
             */
            WireGuardGlobalState.prototype.publicKey = "";

            /**
             * Creates a new WireGuardGlobalState instance using the specified properties.
             * @function create
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {router.manager.IWireGuardGlobalState=} [properties] Properties to set
             * @returns {router.manager.WireGuardGlobalState} WireGuardGlobalState instance
             */
            WireGuardGlobalState.create = function create(properties) {
                return new WireGuardGlobalState(properties);
            };

            /**
             * Encodes the specified WireGuardGlobalState message. Does not implicitly {@link router.manager.WireGuardGlobalState.verify|verify} messages.
             * @function encode
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {router.manager.IWireGuardGlobalState} message WireGuardGlobalState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardGlobalState.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.publicKey);
                return writer;
            };

            /**
             * Encodes the specified WireGuardGlobalState message, length delimited. Does not implicitly {@link router.manager.WireGuardGlobalState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {router.manager.IWireGuardGlobalState} message WireGuardGlobalState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardGlobalState.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WireGuardGlobalState message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.WireGuardGlobalState} WireGuardGlobalState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardGlobalState.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.WireGuardGlobalState();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.publicKey = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WireGuardGlobalState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.WireGuardGlobalState} WireGuardGlobalState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardGlobalState.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WireGuardGlobalState message.
             * @function verify
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WireGuardGlobalState.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    if (!$util.isString(message.publicKey))
                        return "publicKey: string expected";
                return null;
            };

            /**
             * Creates a WireGuardGlobalState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.WireGuardGlobalState} WireGuardGlobalState
             */
            WireGuardGlobalState.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.WireGuardGlobalState)
                    return object;
                var message = new $root.router.manager.WireGuardGlobalState();
                if (object.publicKey != null)
                    message.publicKey = String(object.publicKey);
                return message;
            };

            /**
             * Creates a plain object from a WireGuardGlobalState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {router.manager.WireGuardGlobalState} message WireGuardGlobalState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WireGuardGlobalState.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.publicKey = "";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    object.publicKey = message.publicKey;
                return object;
            };

            /**
             * Converts this WireGuardGlobalState to JSON.
             * @function toJSON
             * @memberof router.manager.WireGuardGlobalState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WireGuardGlobalState.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WireGuardGlobalState
             * @function getTypeUrl
             * @memberof router.manager.WireGuardGlobalState
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WireGuardGlobalState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.WireGuardGlobalState";
            };

            return WireGuardGlobalState;
        })();

        manager.WireGuardGlobalConfig = (function() {

            /**
             * Properties of a WireGuardGlobalConfig.
             * @memberof router.manager
             * @interface IWireGuardGlobalConfig
             * @property {string|null} [privateKey] WireGuardGlobalConfig privateKey
             */

            /**
             * Constructs a new WireGuardGlobalConfig.
             * @memberof router.manager
             * @classdesc Represents a WireGuardGlobalConfig.
             * @implements IWireGuardGlobalConfig
             * @constructor
             * @param {router.manager.IWireGuardGlobalConfig=} [properties] Properties to set
             */
            function WireGuardGlobalConfig(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WireGuardGlobalConfig privateKey.
             * @member {string|null|undefined} privateKey
             * @memberof router.manager.WireGuardGlobalConfig
             * @instance
             */
            WireGuardGlobalConfig.prototype.privateKey = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            // Virtual OneOf for proto3 optional field
            Object.defineProperty(WireGuardGlobalConfig.prototype, "_privateKey", {
                get: $util.oneOfGetter($oneOfFields = ["privateKey"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new WireGuardGlobalConfig instance using the specified properties.
             * @function create
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {router.manager.IWireGuardGlobalConfig=} [properties] Properties to set
             * @returns {router.manager.WireGuardGlobalConfig} WireGuardGlobalConfig instance
             */
            WireGuardGlobalConfig.create = function create(properties) {
                return new WireGuardGlobalConfig(properties);
            };

            /**
             * Encodes the specified WireGuardGlobalConfig message. Does not implicitly {@link router.manager.WireGuardGlobalConfig.verify|verify} messages.
             * @function encode
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {router.manager.IWireGuardGlobalConfig} message WireGuardGlobalConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardGlobalConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.privateKey != null && Object.hasOwnProperty.call(message, "privateKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.privateKey);
                return writer;
            };

            /**
             * Encodes the specified WireGuardGlobalConfig message, length delimited. Does not implicitly {@link router.manager.WireGuardGlobalConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {router.manager.IWireGuardGlobalConfig} message WireGuardGlobalConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardGlobalConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WireGuardGlobalConfig message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.WireGuardGlobalConfig} WireGuardGlobalConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardGlobalConfig.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.WireGuardGlobalConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.privateKey = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WireGuardGlobalConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.WireGuardGlobalConfig} WireGuardGlobalConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardGlobalConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WireGuardGlobalConfig message.
             * @function verify
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WireGuardGlobalConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.privateKey != null && message.hasOwnProperty("privateKey")) {
                    properties._privateKey = 1;
                    if (!$util.isString(message.privateKey))
                        return "privateKey: string expected";
                }
                return null;
            };

            /**
             * Creates a WireGuardGlobalConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.WireGuardGlobalConfig} WireGuardGlobalConfig
             */
            WireGuardGlobalConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.WireGuardGlobalConfig)
                    return object;
                var message = new $root.router.manager.WireGuardGlobalConfig();
                if (object.privateKey != null)
                    message.privateKey = String(object.privateKey);
                return message;
            };

            /**
             * Creates a plain object from a WireGuardGlobalConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {router.manager.WireGuardGlobalConfig} message WireGuardGlobalConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WireGuardGlobalConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (message.privateKey != null && message.hasOwnProperty("privateKey")) {
                    object.privateKey = message.privateKey;
                    if (options.oneofs)
                        object._privateKey = "privateKey";
                }
                return object;
            };

            /**
             * Converts this WireGuardGlobalConfig to JSON.
             * @function toJSON
             * @memberof router.manager.WireGuardGlobalConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WireGuardGlobalConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WireGuardGlobalConfig
             * @function getTypeUrl
             * @memberof router.manager.WireGuardGlobalConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WireGuardGlobalConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.WireGuardGlobalConfig";
            };

            return WireGuardGlobalConfig;
        })();

        manager.WireGuardPeerConfig = (function() {

            /**
             * Properties of a WireGuardPeerConfig.
             * @memberof router.manager
             * @interface IWireGuardPeerConfig
             * @property {string|null} [publicKey] WireGuardPeerConfig publicKey
             * @property {google.protobuf.IDuration|null} [persistentKeepalive] WireGuardPeerConfig persistentKeepalive
             * @property {Array.<string>|null} [allowedIps] WireGuardPeerConfig allowedIps
             */

            /**
             * Constructs a new WireGuardPeerConfig.
             * @memberof router.manager
             * @classdesc Represents a WireGuardPeerConfig.
             * @implements IWireGuardPeerConfig
             * @constructor
             * @param {router.manager.IWireGuardPeerConfig=} [properties] Properties to set
             */
            function WireGuardPeerConfig(properties) {
                this.allowedIps = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WireGuardPeerConfig publicKey.
             * @member {string} publicKey
             * @memberof router.manager.WireGuardPeerConfig
             * @instance
             */
            WireGuardPeerConfig.prototype.publicKey = "";

            /**
             * WireGuardPeerConfig persistentKeepalive.
             * @member {google.protobuf.IDuration|null|undefined} persistentKeepalive
             * @memberof router.manager.WireGuardPeerConfig
             * @instance
             */
            WireGuardPeerConfig.prototype.persistentKeepalive = null;

            /**
             * WireGuardPeerConfig allowedIps.
             * @member {Array.<string>} allowedIps
             * @memberof router.manager.WireGuardPeerConfig
             * @instance
             */
            WireGuardPeerConfig.prototype.allowedIps = $util.emptyArray;

            /**
             * Creates a new WireGuardPeerConfig instance using the specified properties.
             * @function create
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {router.manager.IWireGuardPeerConfig=} [properties] Properties to set
             * @returns {router.manager.WireGuardPeerConfig} WireGuardPeerConfig instance
             */
            WireGuardPeerConfig.create = function create(properties) {
                return new WireGuardPeerConfig(properties);
            };

            /**
             * Encodes the specified WireGuardPeerConfig message. Does not implicitly {@link router.manager.WireGuardPeerConfig.verify|verify} messages.
             * @function encode
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {router.manager.IWireGuardPeerConfig} message WireGuardPeerConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardPeerConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.publicKey);
                if (message.persistentKeepalive != null && Object.hasOwnProperty.call(message, "persistentKeepalive"))
                    $root.google.protobuf.Duration.encode(message.persistentKeepalive, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.allowedIps != null && message.allowedIps.length)
                    for (var i = 0; i < message.allowedIps.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.allowedIps[i]);
                return writer;
            };

            /**
             * Encodes the specified WireGuardPeerConfig message, length delimited. Does not implicitly {@link router.manager.WireGuardPeerConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {router.manager.IWireGuardPeerConfig} message WireGuardPeerConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WireGuardPeerConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WireGuardPeerConfig message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.WireGuardPeerConfig} WireGuardPeerConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardPeerConfig.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.WireGuardPeerConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.publicKey = reader.string();
                            break;
                        }
                    case 2: {
                            message.persistentKeepalive = $root.google.protobuf.Duration.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            if (!(message.allowedIps && message.allowedIps.length))
                                message.allowedIps = [];
                            message.allowedIps.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WireGuardPeerConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.WireGuardPeerConfig} WireGuardPeerConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WireGuardPeerConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WireGuardPeerConfig message.
             * @function verify
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WireGuardPeerConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    if (!$util.isString(message.publicKey))
                        return "publicKey: string expected";
                if (message.persistentKeepalive != null && message.hasOwnProperty("persistentKeepalive")) {
                    var error = $root.google.protobuf.Duration.verify(message.persistentKeepalive);
                    if (error)
                        return "persistentKeepalive." + error;
                }
                if (message.allowedIps != null && message.hasOwnProperty("allowedIps")) {
                    if (!Array.isArray(message.allowedIps))
                        return "allowedIps: array expected";
                    for (var i = 0; i < message.allowedIps.length; ++i)
                        if (!$util.isString(message.allowedIps[i]))
                            return "allowedIps: string[] expected";
                }
                return null;
            };

            /**
             * Creates a WireGuardPeerConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.WireGuardPeerConfig} WireGuardPeerConfig
             */
            WireGuardPeerConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.WireGuardPeerConfig)
                    return object;
                var message = new $root.router.manager.WireGuardPeerConfig();
                if (object.publicKey != null)
                    message.publicKey = String(object.publicKey);
                if (object.persistentKeepalive != null) {
                    if (typeof object.persistentKeepalive !== "object")
                        throw TypeError(".router.manager.WireGuardPeerConfig.persistentKeepalive: object expected");
                    message.persistentKeepalive = $root.google.protobuf.Duration.fromObject(object.persistentKeepalive);
                }
                if (object.allowedIps) {
                    if (!Array.isArray(object.allowedIps))
                        throw TypeError(".router.manager.WireGuardPeerConfig.allowedIps: array expected");
                    message.allowedIps = [];
                    for (var i = 0; i < object.allowedIps.length; ++i)
                        message.allowedIps[i] = String(object.allowedIps[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a WireGuardPeerConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {router.manager.WireGuardPeerConfig} message WireGuardPeerConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WireGuardPeerConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.allowedIps = [];
                if (options.defaults) {
                    object.publicKey = "";
                    object.persistentKeepalive = null;
                }
                if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                    object.publicKey = message.publicKey;
                if (message.persistentKeepalive != null && message.hasOwnProperty("persistentKeepalive"))
                    object.persistentKeepalive = $root.google.protobuf.Duration.toObject(message.persistentKeepalive, options);
                if (message.allowedIps && message.allowedIps.length) {
                    object.allowedIps = [];
                    for (var j = 0; j < message.allowedIps.length; ++j)
                        object.allowedIps[j] = message.allowedIps[j];
                }
                return object;
            };

            /**
             * Converts this WireGuardPeerConfig to JSON.
             * @function toJSON
             * @memberof router.manager.WireGuardPeerConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WireGuardPeerConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WireGuardPeerConfig
             * @function getTypeUrl
             * @memberof router.manager.WireGuardPeerConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WireGuardPeerConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.WireGuardPeerConfig";
            };

            return WireGuardPeerConfig;
        })();

        manager.ProtocolSpecificEvent = (function() {

            /**
             * Properties of a ProtocolSpecificEvent.
             * @memberof router.manager
             * @interface IProtocolSpecificEvent
             * @property {string|null} [protocolName] ProtocolSpecificEvent protocolName
             * @property {Object.<string,string>|null} [metadata] ProtocolSpecificEvent metadata
             */

            /**
             * Constructs a new ProtocolSpecificEvent.
             * @memberof router.manager
             * @classdesc Represents a ProtocolSpecificEvent.
             * @implements IProtocolSpecificEvent
             * @constructor
             * @param {router.manager.IProtocolSpecificEvent=} [properties] Properties to set
             */
            function ProtocolSpecificEvent(properties) {
                this.metadata = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProtocolSpecificEvent protocolName.
             * @member {string} protocolName
             * @memberof router.manager.ProtocolSpecificEvent
             * @instance
             */
            ProtocolSpecificEvent.prototype.protocolName = "";

            /**
             * ProtocolSpecificEvent metadata.
             * @member {Object.<string,string>} metadata
             * @memberof router.manager.ProtocolSpecificEvent
             * @instance
             */
            ProtocolSpecificEvent.prototype.metadata = $util.emptyObject;

            /**
             * Creates a new ProtocolSpecificEvent instance using the specified properties.
             * @function create
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {router.manager.IProtocolSpecificEvent=} [properties] Properties to set
             * @returns {router.manager.ProtocolSpecificEvent} ProtocolSpecificEvent instance
             */
            ProtocolSpecificEvent.create = function create(properties) {
                return new ProtocolSpecificEvent(properties);
            };

            /**
             * Encodes the specified ProtocolSpecificEvent message. Does not implicitly {@link router.manager.ProtocolSpecificEvent.verify|verify} messages.
             * @function encode
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {router.manager.IProtocolSpecificEvent} message ProtocolSpecificEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProtocolSpecificEvent.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.protocolName != null && Object.hasOwnProperty.call(message, "protocolName"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.protocolName);
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    for (var keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ProtocolSpecificEvent message, length delimited. Does not implicitly {@link router.manager.ProtocolSpecificEvent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {router.manager.IProtocolSpecificEvent} message ProtocolSpecificEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProtocolSpecificEvent.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProtocolSpecificEvent message from the specified reader or buffer.
             * @function decode
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {router.manager.ProtocolSpecificEvent} ProtocolSpecificEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProtocolSpecificEvent.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.router.manager.ProtocolSpecificEvent(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.protocolName = reader.string();
                            break;
                        }
                    case 2: {
                            if (message.metadata === $util.emptyObject)
                                message.metadata = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.metadata[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProtocolSpecificEvent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {router.manager.ProtocolSpecificEvent} ProtocolSpecificEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProtocolSpecificEvent.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProtocolSpecificEvent message.
             * @function verify
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProtocolSpecificEvent.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.protocolName != null && message.hasOwnProperty("protocolName"))
                    if (!$util.isString(message.protocolName))
                        return "protocolName: string expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!$util.isObject(message.metadata))
                        return "metadata: object expected";
                    var key = Object.keys(message.metadata);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.metadata[key[i]]))
                            return "metadata: string{k:string} expected";
                }
                return null;
            };

            /**
             * Creates a ProtocolSpecificEvent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {router.manager.ProtocolSpecificEvent} ProtocolSpecificEvent
             */
            ProtocolSpecificEvent.fromObject = function fromObject(object) {
                if (object instanceof $root.router.manager.ProtocolSpecificEvent)
                    return object;
                var message = new $root.router.manager.ProtocolSpecificEvent();
                if (object.protocolName != null)
                    message.protocolName = String(object.protocolName);
                if (object.metadata) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".router.manager.ProtocolSpecificEvent.metadata: object expected");
                    message.metadata = {};
                    for (var keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                        message.metadata[keys[i]] = String(object.metadata[keys[i]]);
                }
                return message;
            };

            /**
             * Creates a plain object from a ProtocolSpecificEvent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {router.manager.ProtocolSpecificEvent} message ProtocolSpecificEvent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProtocolSpecificEvent.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.metadata = {};
                if (options.defaults)
                    object.protocolName = "";
                if (message.protocolName != null && message.hasOwnProperty("protocolName"))
                    object.protocolName = message.protocolName;
                var keys2;
                if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                    object.metadata = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.metadata[keys2[j]] = message.metadata[keys2[j]];
                }
                return object;
            };

            /**
             * Converts this ProtocolSpecificEvent to JSON.
             * @function toJSON
             * @memberof router.manager.ProtocolSpecificEvent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProtocolSpecificEvent.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ProtocolSpecificEvent
             * @function getTypeUrl
             * @memberof router.manager.ProtocolSpecificEvent
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ProtocolSpecificEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/router.manager.ProtocolSpecificEvent";
            };

            return ProtocolSpecificEvent;
        })();

        return manager;
    })();

    return router;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Duration = (function() {

            /**
             * Properties of a Duration.
             * @memberof google.protobuf
             * @interface IDuration
             * @property {number|Long|null} [seconds] Duration seconds
             * @property {number|null} [nanos] Duration nanos
             */

            /**
             * Constructs a new Duration.
             * @memberof google.protobuf
             * @classdesc Represents a Duration.
             * @implements IDuration
             * @constructor
             * @param {google.protobuf.IDuration=} [properties] Properties to set
             */
            function Duration(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Duration seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Duration nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Duration
             * @instance
             */
            Duration.prototype.nanos = 0;

            /**
             * Creates a new Duration instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration=} [properties] Properties to set
             * @returns {google.protobuf.Duration} Duration instance
             */
            Duration.create = function create(properties) {
                return new Duration(properties);
            };

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration} message Duration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Duration.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.IDuration} message Duration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Duration.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Duration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Duration} Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Duration.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Duration();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Duration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Duration} Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Duration.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Duration message.
             * @function verify
             * @memberof google.protobuf.Duration
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Duration.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Duration} Duration
             */
            Duration.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Duration)
                    return object;
                var message = new $root.google.protobuf.Duration();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Duration
             * @static
             * @param {google.protobuf.Duration} message Duration
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Duration.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Duration to JSON.
             * @function toJSON
             * @memberof google.protobuf.Duration
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Duration.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Duration
             * @function getTypeUrl
             * @memberof google.protobuf.Duration
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Duration.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Duration";
            };

            return Duration;
        })();

        protobuf.Empty = (function() {

            /**
             * Properties of an Empty.
             * @memberof google.protobuf
             * @interface IEmpty
             */

            /**
             * Constructs a new Empty.
             * @memberof google.protobuf
             * @classdesc Represents an Empty.
             * @implements IEmpty
             * @constructor
             * @param {google.protobuf.IEmpty=} [properties] Properties to set
             */
            function Empty(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new Empty instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty=} [properties] Properties to set
             * @returns {google.protobuf.Empty} Empty instance
             */
            Empty.create = function create(properties) {
                return new Empty(properties);
            };

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty} message Empty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Empty.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified Empty message, length delimited. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.IEmpty} message Empty message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Empty.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Empty} Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Empty.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Empty();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Empty message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Empty
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Empty} Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Empty.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Empty message.
             * @function verify
             * @memberof google.protobuf.Empty
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Empty.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Empty} Empty
             */
            Empty.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Empty)
                    return object;
                return new $root.google.protobuf.Empty();
            };

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Empty
             * @static
             * @param {google.protobuf.Empty} message Empty
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Empty.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this Empty to JSON.
             * @function toJSON
             * @memberof google.protobuf.Empty
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Empty.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Empty
             * @function getTypeUrl
             * @memberof google.protobuf.Empty
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Empty.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Empty";
            };

            return Empty;
        })();

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                var message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Timestamp";
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
