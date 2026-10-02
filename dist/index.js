var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import { Plugin as Plugin2 } from "@opencode/plugin";

// src/ui/toast-notifier.ts
var ToastNotifier = class {
  static {
    __name(this, "ToastNotifier");
  }
  client;
  // OpenCode client
  constructor(client) {
    this.client = client;
  }
  // Show success toast
  async success(message, title, duration) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title,
          message,
          variant: "success",
          duration: duration || 3e3
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show success toast`, error);
    }
  }
  // Show error toast
  async error(message, title, duration) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title,
          message,
          variant: "error",
          duration: duration || 5e3
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show error toast`, error);
    }
  }
  // Show warning toast
  async warning(message, title, duration) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title,
          message,
          variant: "warning",
          duration: duration || 4e3
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show warning toast`, error);
    }
  }
  // Show info toast
  async info(message, title, duration) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title,
          message,
          variant: "info",
          duration: duration || 3e3
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show info toast`, error);
    }
  }
  // Show loading toast with progress
  async progress(message, title, progress) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title,
          message: progress !== void 0 ? `${message} (${progress}%)` : message,
          variant: "info",
          duration: progress !== void 0 ? 0 : 2e3
          // No auto-dismiss if showing progress
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show progress toast`, error);
    }
  }
  // Show detailed toast with actions
  async detailed(options) {
    try {
      if (!this.client?.tui?.showToast) {
        console.warn("[opencode-models-discovery] Toast API not available (client.tui.showToast missing)");
        return;
      }
      await this.client.tui.showToast({
        body: {
          title: options.title,
          message: options.message,
          variant: options.variant || "info",
          duration: options.duration
        }
      });
    } catch (error) {
      console.error(`[opencode-models-discovery] Failed to show detailed toast`, error);
    }
  }
};

// src/utils/openai-compatible-api.ts
import http from "node:http";
import https from "node:https";
var OPENAI_COMPATIBLE_MODELS_ENDPOINT = "/v1/models";
var DEFAULT_REQUEST_TIMEOUT_MS = 3e3;
var REQUEST_USER_AGENT = "opencode-models-discovery";
function normalizeProviderOriginForCache(baseURL) {
  return new URL(baseURL).origin;
}
__name(normalizeProviderOriginForCache, "normalizeProviderOriginForCache");
function buildAPIURL(baseURL, endpoint = OPENAI_COMPATIBLE_MODELS_ENDPOINT) {
  return new URL(endpoint, new URL(baseURL).origin).toString();
}
__name(buildAPIURL, "buildAPIURL");
function buildModelInfoURL(baseURL, endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return buildAPIURL(baseURL, endpoint);
}
__name(buildModelInfoURL, "buildModelInfoURL");
function requestJson(urlStr, headers, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = /* @__PURE__ */ __name((data) => {
      if (!settled) {
        settled = true;
        resolve(data);
      }
    }, "finish");
    const urlObj = new URL(urlStr);
    const mod = urlObj.protocol === "https:" ? https : http;
    const req = mod.get(urlObj, {
      headers: { "User-Agent": REQUEST_USER_AGENT, ...headers },
      timeout: timeoutMs
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          finish(void 0);
          return;
        }
        try {
          finish(JSON.parse(data));
        } catch {
          finish(void 0);
        }
      });
      res.on("error", () => finish(void 0));
    });
    req.on("error", () => finish(void 0));
    req.on("timeout", () => {
      req.destroy();
      finish(void 0);
    });
  });
}
__name(requestJson, "requestJson");
async function discoverModelsFromProvider(baseURL, apiKey, endpoint = OPENAI_COMPATIBLE_MODELS_ENDPOINT, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const url = buildAPIURL(baseURL, endpoint);
  const headers = {
    "Content-Type": "application/json"
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const data = await requestJson(url, headers, timeoutMs);
  return data ? { ok: true, models: data.data ?? [] } : { ok: false, models: [] };
}
__name(discoverModelsFromProvider, "discoverModelsFromProvider");
async function discoverModelInfoFromProvider(baseURL, apiKey, endpoint = "/v1/model/info", timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const url = buildModelInfoURL(baseURL, endpoint);
  const headers = {
    "Content-Type": "application/json"
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const data = await requestJson(url, headers, timeoutMs);
  return data !== void 0 ? { ok: true, data } : { ok: false, data: void 0 };
}
__name(discoverModelInfoFromProvider, "discoverModelInfoFromProvider");
function isOpenAICompatibleProvider(provider) {
  return provider && typeof provider === "object" && provider.npm === "@ai-sdk/openai-compatible";
}
__name(isOpenAICompatibleProvider, "isOpenAICompatibleProvider");
function hasOpenAICompatibleURL(provider) {
  if (!provider || typeof provider !== "object") return false;
  const baseURL = provider.options?.baseURL || "";
  return /\/v1(\/|$)/.test(baseURL);
}
__name(hasOpenAICompatibleURL, "hasOpenAICompatibleURL");
function hasModelsDiscoveryEndpoint(provider) {
  if (!provider || typeof provider !== "object") return false;
  const endpoint = provider.options?.modelsDiscovery?.endpoint;
  return typeof endpoint === "string" && endpoint.length > 0;
}
__name(hasModelsDiscoveryEndpoint, "hasModelsDiscoveryEndpoint");
function canDiscoverModels(provider) {
  return isOpenAICompatibleProvider(provider) || hasOpenAICompatibleURL(provider) || hasModelsDiscoveryEndpoint(provider);
}
__name(canDiscoverModels, "canDiscoverModels");
function isValidModel(model) {
  return model && typeof model === "object" && typeof model.id === "string" && model.id.length > 0;
}
__name(isValidModel, "isValidModel");

// src/utils/validation/validate-config.ts
function validateConfig(config) {
  const errors = [];
  const warnings = [];
  if (!config || typeof config !== "object") {
    errors.push("Config must be an object");
    return { isValid: false, errors, warnings };
  }
  if (config.provider && typeof config.provider === "object") {
    for (const [providerName, providerConfig] of Object.entries(config.provider)) {
      const p = providerConfig;
      const forceDiscoveryEnabled = p.options?.modelsDiscovery?.enabled === true;
      const discoveryConfig = p.options?.modelsDiscovery;
      const discoveryModels = p.options?.modelsDiscovery?.models;
      if (forceDiscoveryEnabled || canDiscoverModels(p)) {
        if (!p.options?.baseURL) {
          warnings.push(`Provider '${providerName}' missing baseURL`);
        }
        if (p.models && typeof p.models !== "object") {
          errors.push(`Provider '${providerName}' models must be an object`);
        }
      }
      if (discoveryModels && typeof discoveryModels === "object") {
        validateModelFieldFilters(providerName, "includeBy", discoveryModels.includeBy, errors);
        validateModelFieldFilters(providerName, "excludeBy", discoveryModels.excludeBy, errors);
      }
      if (discoveryConfig && typeof discoveryConfig === "object") {
        warnMisplacedModelFieldFilters(providerName, discoveryConfig, warnings);
        validateDiscoveryEndpoint(providerName, discoveryConfig.endpoint, errors);
        validateTimeoutMs(providerName, discoveryConfig.timeoutMs, errors);
        validateCache(providerName, discoveryConfig.cache, errors);
      }
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
__name(validateConfig, "validateConfig");
function validateDiscoveryEndpoint(providerName, value, errors) {
  if (value === void 0) {
    return;
  }
  if (typeof value !== "string" || !value.startsWith("/")) {
    errors.push(`Provider '${providerName}' modelsDiscovery.endpoint must be an origin-relative path starting with /`);
  }
}
__name(validateDiscoveryEndpoint, "validateDiscoveryEndpoint");
function validateTimeoutMs(providerName, value, errors) {
  if (value === void 0) {
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    errors.push(`Provider '${providerName}' modelsDiscovery.timeoutMs must be a positive finite number`);
  }
}
__name(validateTimeoutMs, "validateTimeoutMs");
function validateCache(providerName, value, errors) {
  if (value === void 0) {
    return;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`Provider '${providerName}' modelsDiscovery.cache must be an object`);
    return;
  }
  const cache = value;
  if (cache.enabled !== void 0 && typeof cache.enabled !== "boolean") {
    errors.push(`Provider '${providerName}' modelsDiscovery.cache.enabled must be a boolean`);
  }
  if (cache.ttlSeconds !== void 0 && (typeof cache.ttlSeconds !== "number" || !Number.isFinite(cache.ttlSeconds) || cache.ttlSeconds < 0)) {
    errors.push(`Provider '${providerName}' modelsDiscovery.cache.ttlSeconds must be a non-negative finite number`);
  }
}
__name(validateCache, "validateCache");
function warnMisplacedModelFieldFilters(providerName, discoveryConfig, warnings) {
  for (const key of ["includeBy", "excludeBy"]) {
    if (Object.prototype.hasOwnProperty.call(discoveryConfig, key)) {
      warnings.push(`Provider '${providerName}' modelsDiscovery.${key} is ignored; use modelsDiscovery.models.${key} instead`);
    }
  }
}
__name(warnMisplacedModelFieldFilters, "warnMisplacedModelFieldFilters");
function validateModelFieldFilters(providerName, key, value, errors) {
  if (value === void 0) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`Provider '${providerName}' modelsDiscovery.models.${key} must be an array`);
    return;
  }
  value.forEach((rule, index) => {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      errors.push(`Provider '${providerName}' modelsDiscovery.models.${key}[${index}] must be an object`);
      return;
    }
    const field = rule.field;
    const hasEquals = Object.prototype.hasOwnProperty.call(rule, "equals");
    const hasMatch = Object.prototype.hasOwnProperty.call(rule, "match");
    const equals = rule.equals;
    const match = rule.match;
    if (typeof field !== "string" || field.length === 0) {
      errors.push(`Provider '${providerName}' modelsDiscovery.models.${key}[${index}].field must be a non-empty string`);
    }
    if (hasEquals === hasMatch) {
      errors.push(`Provider '${providerName}' modelsDiscovery.models.${key}[${index}] must include exactly one of equals or match`);
      return;
    }
    if (hasEquals && !(equals === null || ["string", "number", "boolean"].includes(typeof equals))) {
      errors.push(`Provider '${providerName}' modelsDiscovery.models.${key}[${index}].equals must be a string, number, boolean, or null`);
    }
    if (hasMatch && typeof match !== "string") {
      errors.push(`Provider '${providerName}' modelsDiscovery.models.${key}[${index}].match must be a string`);
    }
  });
}
__name(validateModelFieldFilters, "validateModelFieldFilters");

// src/utils/validation/validate-hook-input.ts
function validateHookInput(hookName, input) {
  const errors = [];
  const warnings = [];
  if (!input || typeof input !== "object") {
    errors.push(`${hookName}: Input must be an object`);
    return { isValid: false, errors, warnings };
  }
  switch (hookName) {
    case "config":
      break;
    case "event":
      if (!input.event || typeof input.event !== "object") {
        errors.push("event: event is required and must be an object");
      } else if (!input.event.type) {
        warnings.push("event: event.type is missing");
      }
      break;
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
__name(validateHookInput, "validateHookInput");

// src/plugin/enhance-config.ts
import { promises as fs2 } from "node:fs";
import path2 from "node:path";
import { xdgData as xdgData2 } from "xdg-basedir";

// src/utils/format-model-name.ts
function extractModelOwner(modelId) {
  const parts = modelId.split("/");
  if (parts.length > 1) {
    return parts[0];
  }
  return void 0;
}
__name(extractModelOwner, "extractModelOwner");
function formatModelName(model) {
  const { id } = model;
  const parts = id.split("/");
  const modelPart = parts.length > 1 ? parts[1] : parts[0];
  const acronyms = /* @__PURE__ */ new Set(["gpt", "oss", "api", "gguf", "ggml", "nomic", "vl", "it", "mlx"]);
  const tokens = modelPart.split(/[-_]/).filter(Boolean).map((token) => {
    const lowerToken = token.toLowerCase();
    if (acronyms.has(lowerToken)) {
      return token.toUpperCase();
    }
    if (/^\d+[bkmg]$/i.test(token)) {
      return token.toUpperCase();
    }
    if (/^q\d+$/i.test(token)) {
      return token.toUpperCase();
    }
    if (/^\d+\.\d+/.test(token)) {
      return token;
    }
    if (/^[a-z]\d+[a-z]$/i.test(token) || /^\d+[a-z]$/i.test(token)) {
      return token.toUpperCase();
    }
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(" ");
  return tokens;
}
__name(formatModelName, "formatModelName");

// src/utils/index.ts
function categorizeModel(modelId) {
  const lowerId = modelId.toLowerCase();
  if (lowerId.includes("embedding") || lowerId.includes("embed")) {
    return "embedding";
  }
  return "chat";
}
__name(categorizeModel, "categorizeModel");

// src/utils/disambiguate-model-names.ts
function ownerLabel(modelID) {
  const owner = extractModelOwner(modelID);
  if (!owner) return void 0;
  return owner.split(/[-_]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}
__name(ownerLabel, "ownerLabel");
function disambiguateModelNames(models) {
  const groups = /* @__PURE__ */ new Map();
  for (const model of models) {
    const group = groups.get(model.name) ?? [];
    group.push(model);
    groups.set(model.name, group);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const labels = group.map((model) => ownerLabel(model.id));
    const uniqueLabels = labels.every((label, index) => label && labels.indexOf(label) === index);
    for (const [index, model] of group.entries()) {
      const suffix = uniqueLabels ? labels[index] : model.id;
      model.name = `${model.name} (${suffix ?? model.id})`;
    }
  }
}
__name(disambiguateModelNames, "disambiguateModelNames");

// src/utils/model-info/bifrost.ts
function hasUsableNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber, "hasUsableNumber");
function parseNonNegativeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return void 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : void 0;
}
__name(parseNonNegativeNumber, "parseNonNegativeNumber");
function getModalities(value) {
  if (!Array.isArray(value)) return void 0;
  const supportedModalities = /* @__PURE__ */ new Set(["text", "audio", "image", "video", "pdf"]);
  const modalities = [...new Set(value.filter((modality) => typeof modality === "string").map((modality) => modality.trim().toLowerCase()).map((modality) => modality === "speech" ? "audio" : modality).filter((modality) => supportedModalities.has(modality)))];
  return modalities.length > 0 ? modalities : void 0;
}
__name(getModalities, "getModalities");
function createBifrostModelInfoEnricher(_data) {
  return {
    shouldSkipModel() {
      return false;
    },
    getModelName(_modelId, rawModel) {
      const name = rawModel?.normalized_name;
      return typeof name === "string" && name.length > 0 ? name : void 0;
    },
    applyModelInfo(modelConfig, _modelId, rawModel) {
      const context = rawModel?.context_length;
      const input = rawModel?.max_input_tokens;
      const output = rawModel?.max_output_tokens;
      if (hasUsableNumber(context) && hasUsableNumber(output)) {
        modelConfig.limit = {
          context,
          ...hasUsableNumber(input) ? { input } : {},
          output
        };
      }
      const architecture = rawModel?.architecture;
      if (architecture && typeof architecture === "object" && !Array.isArray(architecture)) {
        const inputModalities = getModalities(architecture.input_modalities);
        const outputModalities = getModalities(architecture.output_modalities);
        if (inputModalities || outputModalities) {
          modelConfig.modalities = {
            ...inputModalities ? { input: inputModalities } : {},
            ...outputModalities ? { output: outputModalities } : {}
          };
        }
      }
      const pricing = rawModel?.pricing;
      if (pricing && typeof pricing === "object" && !Array.isArray(pricing)) {
        const inputCost = parseNonNegativeNumber(pricing.prompt);
        const outputCost = parseNonNegativeNumber(pricing.completion);
        if (inputCost !== void 0 && outputCost !== void 0) {
          modelConfig.cost = {
            input: inputCost * 1e6,
            output: outputCost * 1e6
          };
        }
      }
    }
  };
}
__name(createBifrostModelInfoEnricher, "createBifrostModelInfoEnricher");

// src/utils/model-info/litellm.ts
function hasUsableNumber2(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber2, "hasUsableNumber");
function modelInfoScore(modelId, entry) {
  const info = entry.model_info ?? {};
  const modelIdLower = modelId.toLowerCase();
  let score = 0;
  if (entry.model_name === modelId) score += 8;
  if (info.key === modelId) score += 6;
  if (entry.litellm_params?.model === modelId) score += 4;
  if (entry.litellm_params?.model?.endsWith(`/${modelId}`)) score += 2;
  if (entry.model_name?.toLowerCase() === modelIdLower) score += 3;
  if (info.key?.toLowerCase() === modelIdLower) score += 2;
  if (entry.litellm_params?.model?.toLowerCase() === modelIdLower) score += 2;
  if (entry.litellm_params?.model?.toLowerCase().endsWith(`/${modelIdLower}`)) score += 1;
  if (info.mode === "chat") score += 5;
  if (hasUsableNumber2(info.max_input_tokens) || hasUsableNumber2(info.max_tokens)) score += 10;
  if (info.supports_reasoning === true) score += 4;
  return score;
}
__name(modelInfoScore, "modelInfoScore");
function buildModelInfoMap(entries) {
  const result = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const keys = /* @__PURE__ */ new Set();
    if (entry.model_name) keys.add(entry.model_name);
    if (entry.model_info?.key) keys.add(entry.model_info.key);
    if (entry.litellm_params?.model) {
      keys.add(entry.litellm_params.model);
      const parts = entry.litellm_params.model.split("/");
      if (parts.length > 1) keys.add(parts.slice(1).join("/"));
      keys.add(parts[parts.length - 1]);
    }
    for (const key of keys) {
      for (const lookupKey of /* @__PURE__ */ new Set([key, key.toLowerCase()])) {
        const existing = result.get(lookupKey);
        if (!existing || modelInfoScore(lookupKey, entry) > modelInfoScore(lookupKey, existing)) {
          result.set(lookupKey, entry);
        }
      }
    }
  }
  return result;
}
__name(buildModelInfoMap, "buildModelInfoMap");
function createReasoningVariants(info) {
  if (info.supports_reasoning !== true || !info.supported_openai_params?.includes("reasoning_effort")) {
    return void 0;
  }
  const variants = {};
  if (info.supports_none_reasoning_effort === true) variants.none = { reasoningEffort: "none" };
  if (info.supports_minimal_reasoning_effort === true) variants.minimal = { reasoningEffort: "minimal" };
  if (info.supports_low_reasoning_effort !== false) variants.low = { reasoningEffort: "low" };
  if (info.supports_medium_reasoning_effort !== false) variants.medium = { reasoningEffort: "medium" };
  if (info.supports_high_reasoning_effort !== false) variants.high = { reasoningEffort: "high" };
  if (info.supports_xhigh_reasoning_effort === true) variants.xhigh = { reasoningEffort: "xhigh" };
  if (info.supports_max_reasoning_effort === true) variants.max = { reasoningEffort: "max" };
  return Object.keys(variants).length > 0 ? variants : void 0;
}
__name(createReasoningVariants, "createReasoningVariants");
function getModalities2(value) {
  if (!Array.isArray(value)) return void 0;
  const supportedModalities = /* @__PURE__ */ new Set(["text", "audio", "image", "video", "pdf"]);
  const modalities = [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim().toLowerCase()).map((item) => item === "speech" ? "audio" : item).filter((item) => supportedModalities.has(item)))];
  return modalities.length > 0 ? modalities : void 0;
}
__name(getModalities2, "getModalities");
function buildModalities(info) {
  const input = getModalities2(info.modalities?.input);
  const output = getModalities2(info.modalities?.output);
  const inputDeclared = Array.isArray(info.modalities?.input);
  const outputDeclared = Array.isArray(info.modalities?.output);
  if (inputDeclared && input === void 0 || outputDeclared && output === void 0) return void 0;
  if (input || output) {
    return { input: input ?? ["text"], output: output ?? ["text"] };
  }
  if (info.supports_vision === true) {
    return { input: ["text", "image"], output: ["text"] };
  }
  return void 0;
}
__name(buildModalities, "buildModalities");
function nonNegativeCostPerMillion(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return void 0;
  const perMillion = value * 1e6;
  return Number.isFinite(perMillion) ? perMillion : void 0;
}
__name(nonNegativeCostPerMillion, "nonNegativeCostPerMillion");
function positiveCostPerMillion(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return void 0;
  const perMillion = value * 1e6;
  return Number.isFinite(perMillion) ? perMillion : void 0;
}
__name(positiveCostPerMillion, "positiveCostPerMillion");
function buildCost(info) {
  const input = nonNegativeCostPerMillion(info.input_cost_per_token);
  const output = nonNegativeCostPerMillion(info.output_cost_per_token);
  if (input === void 0 || output === void 0) return void 0;
  const cacheRead = positiveCostPerMillion(info.cache_read_input_token_cost);
  const cacheWrite = positiveCostPerMillion(info.cache_creation_input_token_cost);
  return {
    input,
    output,
    ...cacheRead !== void 0 ? { cache_read: cacheRead } : {},
    ...cacheWrite !== void 0 ? { cache_write: cacheWrite } : {}
  };
}
__name(buildCost, "buildCost");
function applyLiteLLMModelInfo(modelConfig, entry) {
  const info = entry?.model_info;
  if (!info) return;
  const modalities = buildModalities(info);
  if (modalities) {
    modelConfig.modalities = modalities;
  }
  const contextLimit = hasUsableNumber2(info.max_input_tokens) ? info.max_input_tokens : info.max_tokens;
  const outputLimit = hasUsableNumber2(info.max_output_tokens) ? info.max_output_tokens : info.max_tokens;
  if (hasUsableNumber2(contextLimit) && hasUsableNumber2(outputLimit)) {
    modelConfig.limit = {
      context: contextLimit,
      input: hasUsableNumber2(info.max_input_tokens) ? info.max_input_tokens : void 0,
      output: outputLimit
    };
  }
  if (info.supports_reasoning === true) {
    modelConfig.reasoning = true;
  }
  const variants = createReasoningVariants(info);
  if (variants) {
    modelConfig.variants = variants;
  }
  const cost = buildCost(info);
  if (cost) {
    modelConfig.cost = cost;
  }
  if (typeof info.supports_function_calling === "boolean") {
    modelConfig.tool_call = info.supports_function_calling;
  }
  if (Array.isArray(info.supported_openai_params) && info.supported_openai_params.length > 0) {
    modelConfig.temperature = info.supported_openai_params.includes("temperature");
  }
}
__name(applyLiteLLMModelInfo, "applyLiteLLMModelInfo");
function getModelInfo(modelInfoById, modelId) {
  return modelInfoById.get(modelId) ?? modelInfoById.get(modelId.toLowerCase());
}
__name(getModelInfo, "getModelInfo");
function createLiteLLMModelInfoEnricher(data, options) {
  const response = data;
  const modelInfoById = buildModelInfoMap(Array.isArray(response?.data) ? response.data : []);
  return {
    shouldSkipModel(modelId) {
      if (!options?.filterNonChat) return false;
      const mode = getModelInfo(modelInfoById, modelId)?.model_info?.mode;
      return typeof mode === "string" && mode.length > 0 && mode !== "chat";
    },
    applyModelInfo(modelConfig, modelId) {
      applyLiteLLMModelInfo(modelConfig, getModelInfo(modelInfoById, modelId));
    }
  };
}
__name(createLiteLLMModelInfoEnricher, "createLiteLLMModelInfoEnricher");

// src/utils/model-info/lmstudio.ts
function hasUsableNumber3(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber3, "hasUsableNumber");
function getModelKey(model) {
  return typeof model.key === "string" && model.key.length > 0 ? model.key : void 0;
}
__name(getModelKey, "getModelKey");
function getLoadedContextLimit(model) {
  const limits = (model.loaded_instances ?? []).map((instance) => instance.config?.context_length).filter(hasUsableNumber3);
  return limits.length > 0 ? Math.max(...limits) : void 0;
}
__name(getLoadedContextLimit, "getLoadedContextLimit");
function getReasoningOptions(model) {
  return model.capabilities?.reasoning?.allowed_options ?? [];
}
__name(getReasoningOptions, "getReasoningOptions");
function getReasoningVariants(options) {
  const reasoningEfforts = {
    off: "none",
    low: "low",
    medium: "medium",
    high: "high",
    xhigh: "xhigh"
  };
  const variants = {};
  for (const option of options) {
    const reasoningEffort = reasoningEfforts[option];
    if (reasoningEffort) variants[option] = { reasoningEffort };
  }
  return Object.keys(variants).length > 0 ? variants : void 0;
}
__name(getReasoningVariants, "getReasoningVariants");
function getModelInfo2(models, modelId) {
  return models.get(modelId);
}
__name(getModelInfo2, "getModelInfo");
function createLMStudioModelInfoEnricher(data) {
  const models = /* @__PURE__ */ new Map();
  const inventory = data;
  if (Array.isArray(inventory?.models)) {
    for (const model of inventory.models) {
      if (!model || typeof model !== "object") continue;
      const typedModel = model;
      const key = getModelKey(typedModel);
      if (key) models.set(key, typedModel);
    }
  }
  return {
    shouldSkipModel() {
      return false;
    },
    getModelName(modelId) {
      const displayName = getModelInfo2(models, modelId)?.display_name;
      return typeof displayName === "string" && displayName.length > 0 ? displayName : void 0;
    },
    applyModelInfo(modelConfig, modelId) {
      const model = getModelInfo2(models, modelId);
      if (!model) return;
      const contextLimit = getLoadedContextLimit(model) ?? (hasUsableNumber3(model.max_context_length) ? model.max_context_length : void 0);
      if (contextLimit) {
        modelConfig.limit = { context: contextLimit, output: 0 };
      }
      const capabilities = model.capabilities && typeof model.capabilities === "object" ? model.capabilities : void 0;
      if (capabilities?.vision === true) {
        const input = Array.isArray(modelConfig.modalities?.input) ? modelConfig.modalities.input : [];
        const output = Array.isArray(modelConfig.modalities?.output) ? modelConfig.modalities.output : [];
        modelConfig.modalities = {
          input: [.../* @__PURE__ */ new Set([...input, "image"])],
          ...output.length > 0 ? { output } : {}
        };
      }
      if (capabilities?.trained_for_tool_use === true) modelConfig.tool_call = true;
      const reasoningOptions = getReasoningOptions(model);
      if (reasoningOptions.length > 0) {
        modelConfig.reasoning = true;
        const variants = getReasoningVariants(reasoningOptions);
        if (variants) modelConfig.variants = variants;
      }
    }
  };
}
__name(createLMStudioModelInfoEnricher, "createLMStudioModelInfoEnricher");

// src/utils/model-info/llamaswap.ts
function hasUsableNumber4(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber4, "hasUsableNumber");
function hasNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
__name(hasNonNegativeNumber, "hasNonNegativeNumber");
function getRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
__name(getRecord, "getRecord");
function getModalities3(value) {
  if (!Array.isArray(value)) return void 0;
  const supportedModalities = /* @__PURE__ */ new Set(["text", "audio", "image", "video", "pdf"]);
  const modalities = [...new Set(value.filter((modality) => typeof modality === "string").map((modality) => modality.trim().toLowerCase()).filter((modality) => supportedModalities.has(modality)))];
  return modalities.length > 0 ? modalities : void 0;
}
__name(getModalities3, "getModalities");
function getLlamaSwapMetadata(rawModel) {
  return getRecord(getRecord(rawModel?.meta)?.llamaswap);
}
__name(getLlamaSwapMetadata, "getLlamaSwapMetadata");
function createLlamaSwapModelInfoEnricher(_data) {
  return {
    shouldSkipModel() {
      return false;
    },
    getModelName(_modelId, rawModel) {
      const name = rawModel?.name;
      return typeof name === "string" && name.trim().length > 0 ? name.trim() : void 0;
    },
    applyModelInfo(modelConfig, _modelId, rawModel) {
      const meta = getRecord(rawModel?.meta);
      const llamaSwapMetadata = getLlamaSwapMetadata(rawModel);
      const context = hasUsableNumber4(rawModel?.context_length) ? rawModel.context_length : hasUsableNumber4(meta?.n_ctx) ? meta.n_ctx : void 0;
      if (context) {
        const input = hasUsableNumber4(llamaSwapMetadata?.max_input_tokens) ? llamaSwapMetadata.max_input_tokens : void 0;
        const output = hasNonNegativeNumber(llamaSwapMetadata?.max_output_tokens) ? llamaSwapMetadata.max_output_tokens : 0;
        modelConfig.limit = {
          context,
          ...input ? { input } : {},
          output
        };
      }
      const architecture = getRecord(rawModel?.architecture);
      const inputModalities = getModalities3(architecture?.input_modalities);
      const outputModalities = getModalities3(architecture?.output_modalities);
      if (inputModalities || outputModalities) {
        modelConfig.modalities = {
          ...inputModalities ? { input: inputModalities } : {},
          ...outputModalities ? { output: outputModalities } : {},
          ...!inputModalities && modelConfig.modalities?.input ? { input: modelConfig.modalities.input } : {},
          ...!outputModalities && modelConfig.modalities?.output ? { output: modelConfig.modalities.output } : {}
        };
      }
      const capabilities = getRecord(rawModel?.capabilities);
      const supportedParameters = Array.isArray(rawModel?.supported_parameters) ? rawModel.supported_parameters : [];
      if (capabilities?.function_calling === true || supportedParameters.includes("tools")) {
        modelConfig.tool_call = true;
      }
    }
  };
}
__name(createLlamaSwapModelInfoEnricher, "createLlamaSwapModelInfoEnricher");

// src/utils/models-dev-fetcher.ts
var DEFAULT_MODELS_DEV_URL = "https://models.dev/models.json";
var PREFIX_MATCH_MIN_SCORE = 70;
var PREFIX_MATCH_MIN_SHARED_PARTS = 2;
var modelsDevCaches = /* @__PURE__ */ new Map();
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isObject, "isObject");
function toModelId(providerId, modelId) {
  return providerId ? `${providerId}/${modelId}` : modelId;
}
__name(toModelId, "toModelId");
function addModel(cache, providerId, rawModel, fallbackModelId) {
  const rawId = typeof rawModel.id === "string" && rawModel.id.length > 0 ? rawModel.id : fallbackModelId;
  if (!rawId) {
    return;
  }
  const id = rawId.includes("/") ? rawId : toModelId(providerId, rawId);
  cache.set(id, {
    id,
    name: typeof rawModel.name === "string" ? rawModel.name : void 0,
    attachment: typeof rawModel.attachment === "boolean" ? rawModel.attachment : void 0,
    reasoning: typeof rawModel.reasoning === "boolean" ? rawModel.reasoning : void 0,
    tool_call: typeof rawModel.tool_call === "boolean" ? rawModel.tool_call : void 0,
    structured_output: typeof rawModel.structured_output === "boolean" ? rawModel.structured_output : void 0,
    temperature: typeof rawModel.temperature === "boolean" ? rawModel.temperature : void 0,
    modalities: isObject(rawModel.modalities) ? {
      input: Array.isArray(rawModel.modalities.input) ? rawModel.modalities.input.filter((item) => typeof item === "string") : void 0,
      output: Array.isArray(rawModel.modalities.output) ? rawModel.modalities.output.filter((item) => typeof item === "string") : void 0
    } : void 0,
    limit: isObject(rawModel.limit) ? {
      context: typeof rawModel.limit.context === "number" ? rawModel.limit.context : void 0,
      input: typeof rawModel.limit.input === "number" ? rawModel.limit.input : void 0,
      output: typeof rawModel.limit.output === "number" ? rawModel.limit.output : void 0
    } : void 0
  });
}
__name(addModel, "addModel");
function parseModelsDevData(data) {
  const cache = /* @__PURE__ */ new Map();
  if (!isObject(data)) {
    return cache;
  }
  for (const [key, value] of Object.entries(data)) {
    if (!isObject(value)) {
      continue;
    }
    if (isObject(value.models)) {
      for (const [modelId, model] of Object.entries(value.models)) {
        if (isObject(model)) {
          addModel(cache, key, model, modelId);
        }
      }
      continue;
    }
    addModel(cache, void 0, value, key);
  }
  return cache;
}
__name(parseModelsDevData, "parseModelsDevData");
async function fetchModelsDevData(url = DEFAULT_MODELS_DEV_URL) {
  const cached = modelsDevCaches.get(url);
  if (cached) return cached;
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(3e3)
    });
    if (!response.ok) {
      return /* @__PURE__ */ new Map();
    }
    const models = parseModelsDevData(await response.json());
    modelsDevCaches.set(url, models);
    return models;
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
__name(fetchModelsDevData, "fetchModelsDevData");
function splitModelId(modelId) {
  const parts = modelId.split("/");
  if (parts.length <= 1) {
    return { model: modelId };
  }
  return {
    provider: parts[0].toLowerCase(),
    model: parts.slice(1).join("/")
  };
}
__name(splitModelId, "splitModelId");
function calculatePrefixScore(modelA, modelB) {
  const partsA = modelA.split("-");
  const partsB = modelB.split("-");
  const shorter = partsA.length <= partsB.length ? partsA : partsB;
  const longer = partsA.length <= partsB.length ? partsB : partsA;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) {
      return 0;
    }
  }
  if (shorter.length < PREFIX_MATCH_MIN_SHARED_PARTS) {
    return 0;
  }
  return Math.max(0, 100 - (longer.length - shorter.length) * 10);
}
__name(calculatePrefixScore, "calculatePrefixScore");
function lookupModelsDevData(modelId, cache) {
  let cleanId = modelId.replace(/:[a-zA-Z0-9_-]+$/g, "");
  const parts = cleanId.split("/");
  if (parts.length > 2) {
    cleanId = parts.slice(-2).join("/");
  }
  const exactMatch = cache.get(cleanId) ?? cache.get(cleanId.toLowerCase());
  if (exactMatch) return exactMatch;
  const requestedModelLower = splitModelId(cleanId).model.toLowerCase();
  const allCandidates = [];
  for (const [key, value] of cache.entries()) {
    const candidate = splitModelId(key);
    const candidateModelLower = candidate.model.toLowerCase();
    allCandidates.push([candidateModelLower, value]);
  }
  const exactModelMatches = allCandidates.filter(([candidateModel]) => candidateModel === requestedModelLower);
  if (exactModelMatches.length === 1) return exactModelMatches[0]?.[1];
  if (exactModelMatches.length > 1) return void 0;
  let bestMatch;
  let bestScore = 0;
  let bestScoreMatches = 0;
  for (const [candidateModel, value] of allCandidates) {
    const score = calculatePrefixScore(requestedModelLower, candidateModel);
    if (score >= PREFIX_MATCH_MIN_SCORE && score > bestScore) {
      bestScore = score;
      bestMatch = value;
      bestScoreMatches = 1;
    } else if (score >= PREFIX_MATCH_MIN_SCORE && score === bestScore) {
      bestScoreMatches++;
    }
  }
  return bestScoreMatches === 1 ? bestMatch : void 0;
}
__name(lookupModelsDevData, "lookupModelsDevData");

// src/utils/model-info/models-dev.ts
function hasUsableNumber5(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber5, "hasUsableNumber");
function applyModelsDevModelInfo(modelConfig, info) {
  if (!info) return;
  const contextLimit = hasUsableNumber5(info.limit?.context) ? info.limit.context : info.limit?.input;
  const outputLimit = info.limit?.output;
  if (hasUsableNumber5(contextLimit)) {
    modelConfig.limit = {
      context: contextLimit,
      ...hasUsableNumber5(info.limit?.input) ? { input: info.limit.input } : {},
      output: hasUsableNumber5(outputLimit) ? outputLimit : 0
    };
  }
  if (typeof info.attachment === "boolean") modelConfig.attachment = info.attachment;
  if (typeof info.reasoning === "boolean") modelConfig.reasoning = info.reasoning;
  if (typeof info.tool_call === "boolean") modelConfig.tool_call = info.tool_call;
  if (typeof info.structured_output === "boolean") modelConfig.structured_output = info.structured_output;
  if (typeof info.temperature === "boolean") modelConfig.temperature = info.temperature;
  if (info.modalities?.input?.length || info.modalities?.output?.length) {
    modelConfig.modalities = {
      ...info.modalities.input?.length ? { input: info.modalities.input } : {},
      ...info.modalities.output?.length ? { output: info.modalities.output } : {}
    };
  }
}
__name(applyModelsDevModelInfo, "applyModelsDevModelInfo");
function createModelsDevModelInfoEnricher(data) {
  const cache = data instanceof Map ? data : /* @__PURE__ */ new Map();
  return {
    shouldSkipModel() {
      return false;
    },
    getModelName(modelId) {
      return lookupModelsDevData(modelId, cache)?.name;
    },
    applyModelInfo(modelConfig, modelId) {
      applyModelsDevModelInfo(modelConfig, lookupModelsDevData(modelId, cache));
    }
  };
}
__name(createModelsDevModelInfoEnricher, "createModelsDevModelInfoEnricher");

// src/utils/model-info/omniroute.ts
function hasUsableNumber6(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber6, "hasUsableNumber");
function getModalities4(value) {
  if (!Array.isArray(value)) return void 0;
  const supportedModalities = /* @__PURE__ */ new Set(["text", "audio", "image", "video", "pdf"]);
  const modalities = [...new Set(value.filter((modality) => typeof modality === "string").map((modality) => modality.trim().toLowerCase()).map((modality) => modality === "speech" ? "audio" : modality).filter((modality) => supportedModalities.has(modality)))];
  return modalities.length > 0 ? modalities : void 0;
}
__name(getModalities4, "getModalities");
function getCapabilities(rawModel) {
  const capabilities = rawModel?.capabilities;
  return capabilities && typeof capabilities === "object" && !Array.isArray(capabilities) ? capabilities : void 0;
}
__name(getCapabilities, "getCapabilities");
function getReasoningVariants2(capabilities) {
  if (capabilities?.reasoning !== true || !Array.isArray(capabilities.effort_tiers)) return void 0;
  const supportedTiers = {
    none: true,
    minimal: true,
    low: true,
    medium: true,
    high: true,
    xhigh: true,
    max: true,
    ultra: true
  };
  const variants = Object.fromEntries(
    capabilities.effort_tiers.filter((tier) => typeof tier === "string").map((tier) => tier.trim().toLowerCase()).filter((tier) => supportedTiers[tier] === true).map((tier) => [tier, { reasoningEffort: tier }])
  );
  return Object.keys(variants).length > 0 ? variants : void 0;
}
__name(getReasoningVariants2, "getReasoningVariants");
function normalizeServiceTier(value) {
  if (typeof value !== "string") return void 0;
  const tier = value.trim().toLowerCase();
  if (tier === "priority" || tier === "fast") return "fast";
  if (tier === "flex") return "flex";
  return void 0;
}
__name(normalizeServiceTier, "normalizeServiceTier");
function getServiceTierVariants(rawModel, capabilities) {
  const tiers = /* @__PURE__ */ new Set();
  const addTier = /* @__PURE__ */ __name((value) => {
    const tier = normalizeServiceTier(value);
    if (tier) tiers.add(tier);
  }, "addTier");
  if (Array.isArray(capabilities?.service_tiers)) {
    capabilities.service_tiers.forEach(addTier);
  }
  if (Array.isArray(rawModel?.service_tiers)) {
    for (const entry of rawModel.service_tiers) {
      if (typeof entry === "string") {
        addTier(entry);
      } else if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        addTier(entry.id);
      }
    }
  }
  if (Array.isArray(rawModel?.additional_speed_tiers)) {
    rawModel.additional_speed_tiers.forEach(addTier);
  }
  if (tiers.size === 0) return void 0;
  return Object.fromEntries(
    [...tiers].map((tier) => [tier, { body: { service_tier: tier } }])
  );
}
__name(getServiceTierVariants, "getServiceTierVariants");
function createOmniRouteModelInfoEnricher(_data) {
  return {
    shouldSkipModel() {
      return false;
    },
    applyModelInfo(modelConfig, _modelId, rawModel) {
      const context = rawModel?.context_length;
      const inputLimit = rawModel?.max_input_tokens;
      const output = rawModel?.max_output_tokens;
      if (hasUsableNumber6(context) && hasUsableNumber6(output)) {
        modelConfig.limit = {
          context,
          ...hasUsableNumber6(inputLimit) ? { input: inputLimit } : {},
          output
        };
      }
      const capabilities = getCapabilities(rawModel);
      const inputModalities = getModalities4(rawModel?.input_modalities);
      const outputModalities = getModalities4(rawModel?.output_modalities);
      const input = inputModalities ?? (capabilities?.vision === true ? ["text", "image"] : void 0);
      if (input || outputModalities) {
        modelConfig.modalities = {
          ...input ? { input } : {},
          ...outputModalities ? { output: outputModalities } : {},
          ...!input && modelConfig.modalities?.input ? { input: modelConfig.modalities.input } : {},
          ...!outputModalities && modelConfig.modalities?.output ? { output: modelConfig.modalities.output } : {}
        };
      }
      if (typeof capabilities?.attachment === "boolean") modelConfig.attachment = capabilities.attachment;
      if (typeof capabilities?.reasoning === "boolean") modelConfig.reasoning = capabilities.reasoning;
      if (typeof capabilities?.tool_calling === "boolean") modelConfig.tool_call = capabilities.tool_calling;
      if (typeof capabilities?.structured_output === "boolean") modelConfig.structured_output = capabilities.structured_output;
      if (typeof capabilities?.temperature === "boolean") modelConfig.temperature = capabilities.temperature;
      const variants = {
        ...getReasoningVariants2(capabilities) ?? {},
        ...getServiceTierVariants(rawModel, capabilities) ?? {}
      };
      if (Object.keys(variants).length > 0) modelConfig.variants = variants;
    }
  };
}
__name(createOmniRouteModelInfoEnricher, "createOmniRouteModelInfoEnricher");

// src/utils/model-info/vllm.ts
function hasUsableNumber7(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
__name(hasUsableNumber7, "hasUsableNumber");
function createVLLMModelInfoEnricher(_data, _options) {
  return {
    shouldSkipModel() {
      return false;
    },
    applyModelInfo(modelConfig, _modelId, rawModel) {
      const maxModelLen = rawModel?.max_model_len;
      if (hasUsableNumber7(maxModelLen)) {
        modelConfig.limit = {
          context: maxModelLen,
          output: maxModelLen
        };
      }
    }
  };
}
__name(createVLLMModelInfoEnricher, "createVLLMModelInfoEnricher");

// src/types/plugin-config.ts
var ModelInfoFormat = /* @__PURE__ */ ((ModelInfoFormat2) => {
  ModelInfoFormat2["Bifrost"] = "bifrost";
  ModelInfoFormat2["LiteLLM"] = "litellm";
  ModelInfoFormat2["ModelsDev"] = "models.dev";
  ModelInfoFormat2["VLLM"] = "vllm";
  ModelInfoFormat2["LMStudio"] = "lmstudio";
  ModelInfoFormat2["LlamaSwap"] = "llama-swap";
  ModelInfoFormat2["OmniRoute"] = "omniroute";
  return ModelInfoFormat2;
})(ModelInfoFormat || {});
var DEFAULT_CACHE_TTL_SECONDS = 86400;
var DEFAULT_DISCOVERY_CONFIG = {
  enabled: true
};
function getDefaultDiscoveryConfigFromEnv(logger) {
  const rawValue = process.env.OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED;
  if (rawValue === void 0) {
    return DEFAULT_DISCOVERY_CONFIG;
  }
  const normalizedValue = rawValue.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalizedValue)) {
    return { enabled: true };
  }
  if (["false", "0", "no", "off"].includes(normalizedValue)) {
    return { enabled: false };
  }
  if (logger) {
    logger.warn("Ignoring invalid OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED value", {
      value: rawValue,
      fallback: DEFAULT_DISCOVERY_CONFIG.enabled
    });
  } else {
    console.warn(`[opencode-models-discovery] Ignoring invalid OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED value: ${rawValue}`);
  }
  return DEFAULT_DISCOVERY_CONFIG;
}
__name(getDefaultDiscoveryConfigFromEnv, "getDefaultDiscoveryConfigFromEnv");
function hasLegacyGlobalDiscoveryConfig(config) {
  return config.discovery !== void 0 || config.providers !== void 0 || config.models !== void 0 || config.smartModelName !== void 0;
}
__name(hasLegacyGlobalDiscoveryConfig, "hasLegacyGlobalDiscoveryConfig");
function shouldDiscoverProviderWithOverride(defaultEnabled, providerConfig) {
  if (providerConfig.enabled === true) {
    return true;
  }
  if (providerConfig.enabled === false) {
    return false;
  }
  return defaultEnabled;
}
__name(shouldDiscoverProviderWithOverride, "shouldDiscoverProviderWithOverride");
function toRegExp(pattern, logger) {
  try {
    return new RegExp(pattern);
  } catch {
    if (logger) {
      logger.warn("Ignoring invalid model regex", { category: "filtering", pattern });
    } else {
      console.warn(`[opencode-models-discovery] Ignoring invalid model regex: ${pattern}`);
    }
    return null;
  }
}
__name(toRegExp, "toRegExp");
function getProviderModelRegexFilter(config, logger) {
  return {
    includeRegex: (config.models?.includeRegex || []).map((pattern) => toRegExp(pattern, logger)).filter((pattern) => pattern !== null),
    excludeRegex: (config.models?.excludeRegex || []).map((pattern) => toRegExp(pattern, logger)).filter((pattern) => pattern !== null)
  };
}
__name(getProviderModelRegexFilter, "getProviderModelRegexFilter");
function toModelFieldFilter(filter, logger) {
  if ("match" in filter) {
    try {
      return {
        field: filter.field,
        match: new RegExp(filter.match)
      };
    } catch {
      if (logger) {
        logger.warn("Ignoring invalid model field regex", { category: "filtering", field: filter.field, pattern: filter.match });
      } else {
        console.warn(`[opencode-models-discovery] Ignoring invalid model field regex for ${filter.field}: ${filter.match}`);
      }
      return null;
    }
  }
  return filter;
}
__name(toModelFieldFilter, "toModelFieldFilter");
function getProviderModelFieldFilters(config, logger) {
  return {
    includeBy: (config.models?.includeBy || []).map((filter) => toModelFieldFilter(filter, logger)).filter((filter) => filter !== null),
    excludeBy: (config.models?.excludeBy || []).map((filter) => toModelFieldFilter(filter, logger)).filter((filter) => filter !== null)
  };
}
__name(getProviderModelFieldFilters, "getProviderModelFieldFilters");
function matchesModelFieldFilter(model, filter) {
  if (!Object.prototype.hasOwnProperty.call(model, filter.field)) {
    return false;
  }
  const value = model[filter.field];
  if ("match" in filter) {
    return typeof value === "string" && filter.match.test(value);
  }
  return value === filter.equals;
}
__name(matchesModelFieldFilter, "matchesModelFieldFilter");
function shouldDiscoverModelByFields(model, filters2) {
  if (filters2.includeBy.length > 0 && !filters2.includeBy.some((filter) => matchesModelFieldFilter(model, filter))) {
    return false;
  }
  if (filters2.excludeBy.some((filter) => matchesModelFieldFilter(model, filter))) {
    return false;
  }
  return true;
}
__name(shouldDiscoverModelByFields, "shouldDiscoverModelByFields");
function shouldDiscoverModel(modelId, filter) {
  if (filter.includeRegex.length > 0) {
    return filter.includeRegex.some((pattern) => pattern.test(modelId));
  }
  if (filter.excludeRegex.length > 0) {
    return !filter.excludeRegex.some((pattern) => pattern.test(modelId));
  }
  return true;
}
__name(shouldDiscoverModel, "shouldDiscoverModel");
function parsePluginConfig(rawConfig) {
  if (!rawConfig) {
    return {};
  }
  if (Array.isArray(rawConfig)) {
    if (rawConfig.length >= 2 && typeof rawConfig[0] === "string") {
      const configObj = rawConfig[1];
      if (configObj && typeof configObj === "object") {
        return configObj;
      }
    }
    return {};
  }
  if (typeof rawConfig === "object") {
    return rawConfig;
  }
  return {};
}
__name(parsePluginConfig, "parsePluginConfig");

// src/utils/model-info/index.ts
var MODEL_INFO_ENRICHERS = {
  ["bifrost" /* Bifrost */]: createBifrostModelInfoEnricher,
  ["litellm" /* LiteLLM */]: createLiteLLMModelInfoEnricher,
  ["models.dev" /* ModelsDev */]: createModelsDevModelInfoEnricher,
  ["vllm" /* VLLM */]: createVLLMModelInfoEnricher,
  ["lmstudio" /* LMStudio */]: createLMStudioModelInfoEnricher,
  ["llama-swap" /* LlamaSwap */]: createLlamaSwapModelInfoEnricher,
  ["omniroute" /* OmniRoute */]: createOmniRouteModelInfoEnricher
};
function createModelInfoEnricher(format, data, options) {
  return MODEL_INFO_ENRICHERS[format]?.(data, options);
}
__name(createModelInfoEnricher, "createModelInfoEnricher");
function isSupportedModelInfoFormat(format) {
  return MODEL_INFO_ENRICHERS[format] !== void 0;
}
__name(isSupportedModelInfoFormat, "isSupportedModelInfoFormat");

// src/plugin/provider-model-store.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { xdgData } from "xdg-basedir";
var STATE_VERSION = 2;
var PLUGIN_DATA_DIRECTORY = "opencode-models-discovery";
var PROVIDERS_DIRECTORY = "providers";
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
__name(isPlainObject, "isPlainObject");
function hasSameIdentity(actual, expected) {
  return actual.id === expected.id && actual.baseURL === expected.baseURL && actual.endpoint === expected.endpoint;
}
__name(hasSameIdentity, "hasSameIdentity");
function isIdentity(value) {
  return isPlainObject(value) && typeof value.id === "string" && typeof value.baseURL === "string" && typeof value.endpoint === "string";
}
__name(isIdentity, "isIdentity");
function isOverrides(value) {
  return isPlainObject(value) && Object.entries(value).every(([modelID, override]) => modelID.length > 0 && isPlainObject(override));
}
__name(isOverrides, "isOverrides");
function isProviderModelState(value) {
  if (!isPlainObject(value) || value.version !== STATE_VERSION || !isIdentity(value.provider) || typeof value.fetchedAt !== "string" || !Number.isFinite(Date.parse(value.fetchedAt)) || !isPlainObject(value.models) || !Object.entries(value.models).every(([modelID, model]) => modelID.length > 0 && isValidModel(model) && model.id === modelID)) {
    return false;
  }
  return value.overrides === void 0 || isOverrides(value.overrides);
}
__name(isProviderModelState, "isProviderModelState");
function removeSensitiveFields(value) {
  if (Array.isArray(value)) {
    return value.map(removeSensitiveFields);
  }
  if (!isPlainObject(value)) {
    return value;
  }
  const cleaned = {};
  for (const [key, child] of Object.entries(value)) {
    if (/^(api[-_]?key|authorization|token|password|secret|credentials?)$/i.test(key)) {
      continue;
    }
    cleaned[key] = removeSensitiveFields(child);
  }
  return cleaned;
}
__name(removeSensitiveFields, "removeSensitiveFields");
function sanitizeModels(models) {
  return Object.fromEntries(Object.entries(models).map(([modelID, model]) => [
    modelID,
    removeSensitiveFields(model)
  ]));
}
__name(sanitizeModels, "sanitizeModels");
function getProviderStateFileName(providerID) {
  return `provider-${encodeURIComponent(providerID)}.json`;
}
__name(getProviderStateFileName, "getProviderStateFileName");
function isInventoryFresh(state, ttlSeconds, now = Date.now()) {
  return Date.parse(state.fetchedAt) + ttlSeconds * 1e3 > now;
}
__name(isInventoryFresh, "isInventoryFresh");
var ProviderModelStore = class {
  static {
    __name(this, "ProviderModelStore");
  }
  providersDirectory;
  constructor(rootDirectory = xdgData) {
    this.providersDirectory = rootDirectory ? path.join(rootDirectory, PLUGIN_DATA_DIRECTORY, PROVIDERS_DIRECTORY) : void 0;
  }
  getStatePath(providerID) {
    return this.providersDirectory ? path.join(this.providersDirectory, getProviderStateFileName(providerID)) : void 0;
  }
  async read(identity) {
    const statePath = this.getStatePath(identity.id);
    if (!statePath) {
      return void 0;
    }
    try {
      const state = JSON.parse(await fs.readFile(statePath, "utf8"));
      return isProviderModelState(state) && hasSameIdentity(state.provider, identity) ? state : void 0;
    } catch {
      return void 0;
    }
  }
  async saveModels(identity, models, previousState) {
    const statePath = this.getStatePath(identity.id);
    if (!statePath) {
      return false;
    }
    const state = {
      version: STATE_VERSION,
      provider: identity,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      models: sanitizeModels(models),
      ...previousState?.overrides && Object.keys(previousState.overrides).length > 0 ? { overrides: previousState.overrides } : {}
    };
    const temporaryPath = path.join(path.dirname(statePath), `.${path.basename(statePath)}.${process.pid}.${Date.now()}.tmp`);
    try {
      await fs.mkdir(path.dirname(statePath), { recursive: true, mode: 448 });
      await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), { encoding: "utf8", mode: 384 });
      await fs.rename(temporaryPath, statePath);
      return true;
    } catch {
      try {
        await fs.unlink(temporaryPath);
      } catch {
      }
      return false;
    }
  }
};
function mergeModelOverride(base, override) {
  if (!override) {
    return base;
  }
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (key === "id") {
      continue;
    }
    const current = merged[key];
    merged[key] = isPlainObject(current) && isPlainObject(value) ? mergeModelOverride(current, value) : value;
  }
  return merged;
}
__name(mergeModelOverride, "mergeModelOverride");

// src/plugin/enhance-config.ts
var RESOLVED_PROVIDERS_TIMEOUT_MS = 250;
var DEFAULT_LITELLM_MODEL_INFO_ENDPOINT = "/v1/model/info";
var DEFAULT_LMSTUDIO_MODELS_ENDPOINT = "/api/v1/models";
var defaultProviderModelStore = new ProviderModelStore();
var currentProviderModelStore = defaultProviderModelStore;
var injectedModelsByConfig = /* @__PURE__ */ new WeakMap();
function getInjectedModels(config, providerID) {
  return injectedModelsByConfig.get(config)?.get(providerID) ?? /* @__PURE__ */ new Map();
}
__name(getInjectedModels, "getInjectedModels");
function replaceInjectedModels(config, providerID, models) {
  let providers = injectedModelsByConfig.get(config);
  if (!providers) {
    providers = /* @__PURE__ */ new Map();
    injectedModelsByConfig.set(config, providers);
  }
  providers.set(providerID, new Map(Object.entries(models)));
}
__name(replaceInjectedModels, "replaceInjectedModels");
function getExplicitModels(config, providerID, models) {
  const injectedModels = getInjectedModels(config, providerID);
  return Object.fromEntries(Object.entries(models).filter(([modelID, model]) => injectedModels.get(modelID) !== model));
}
__name(getExplicitModels, "getExplicitModels");
async function getResolvedProvidersByID(client, logger, timeoutMs = RESOLVED_PROVIDERS_TIMEOUT_MS) {
  try {
    const loadProviders = client.config?.providers;
    if (typeof loadProviders !== "function") {
      return /* @__PURE__ */ new Map();
    }
    const result = await Promise.race([
      loadProviders.call(client.config),
      new Promise((resolve) => {
        setTimeout(() => resolve(void 0), timeoutMs);
      })
    ]);
    if (!result) {
      logger.debug("Timed out loading resolved providers");
      return /* @__PURE__ */ new Map();
    }
    const providers = result?.data?.providers;
    if (!Array.isArray(providers)) {
      return /* @__PURE__ */ new Map();
    }
    return new Map(
      providers.filter((provider) => typeof provider?.id === "string").map((provider) => [provider.id, provider])
    );
  } catch (error) {
    logger.debug("Could not load resolved providers", {
      error: error instanceof Error ? error.message : String(error)
    });
    return /* @__PURE__ */ new Map();
  }
}
__name(getResolvedProvidersByID, "getResolvedProvidersByID");
function detectHostClient() {
  if (process.env.OPENCODE === "1") {
    return "opencode";
  }
  if (process.env.MIMOCODE === "1") {
    return "mimocode";
  }
  return "opencode";
}
__name(detectHostClient, "detectHostClient");
function getHostAuthFile() {
  if (!xdgData2) {
    return void 0;
  }
  const hostClient = detectHostClient();
  return path2.join(xdgData2, hostClient, "auth.json");
}
__name(getHostAuthFile, "getHostAuthFile");
async function getOpenCodeAuth(providerName, logger) {
  const normalizedProviderName = providerName.replace(/\/+$/, "");
  try {
    if (process.env.OPENCODE_AUTH_CONTENT) {
      const auths = JSON.parse(process.env.OPENCODE_AUTH_CONTENT);
      return auths[providerName] ?? auths[normalizedProviderName] ?? auths[`${normalizedProviderName}/`];
    }
  } catch (error) {
    logger.debug("Could not parse OPENCODE_AUTH_CONTENT", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
  const file = getHostAuthFile();
  if (file) {
    try {
      const auths = JSON.parse(await fs2.readFile(file, "utf8"));
      return auths[providerName] ?? auths[normalizedProviderName] ?? auths[`${normalizedProviderName}/`];
    } catch (error) {
      if (error?.code !== "ENOENT") {
        logger.debug("Could not read host auth store", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  return void 0;
}
__name(getOpenCodeAuth, "getOpenCodeAuth");
function getConfiguredApiKey(providerConfig) {
  const explicitApiKey = providerConfig.options?.apiKey;
  if (typeof explicitApiKey === "string" && explicitApiKey.trim().length > 0) {
    return explicitApiKey;
  }
  return void 0;
}
__name(getConfiguredApiKey, "getConfiguredApiKey");
async function getProviderApiKey(providerName, providerConfig, client, loader, logger) {
  const explicitApiKey = getConfiguredApiKey(providerConfig);
  if (explicitApiKey) {
    return explicitApiKey;
  }
  loader.promise ??= getResolvedProvidersByID(client, logger);
  const resolvedProvider = (await loader.promise).get(providerName);
  if (typeof resolvedProvider?.key === "string" && resolvedProvider.key.trim().length > 0) {
    return resolvedProvider.key;
  }
  const auth = await getOpenCodeAuth(providerName, logger);
  if (auth?.type === "api" && typeof auth.key === "string" && auth.key.trim().length > 0) {
    return auth.key;
  }
  return void 0;
}
__name(getProviderApiKey, "getProviderApiKey");
async function enhanceConfig(config, client, toastNotifier, pluginConfig, logger) {
  try {
    const providers = config.provider || {};
    const openAICompatibleProviders = [];
    const discoveryConfig = getDefaultDiscoveryConfigFromEnv(logger.child({ category: "config" }));
    const defaultDiscoveryEnabled = discoveryConfig.enabled;
    const resolvedProvidersLoader = {};
    for (const [providerName, providerConfig] of Object.entries(providers)) {
      const p = providerConfig;
      const providerDiscoveryConfig = p.options?.modelsDiscovery ?? {};
      const modelsEndpoint = providerDiscoveryConfig.endpoint ?? "/v1/models";
      const timeoutMs = providerDiscoveryConfig.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
      const modelInfoFormat = providerDiscoveryConfig.modelInfoFormat;
      const filterNonChat = providerDiscoveryConfig.filterNonChat !== false;
      const forceDiscoveryEnabled = providerDiscoveryConfig.enabled === true;
      if (!forceDiscoveryEnabled && !canDiscoverModels(p)) {
        continue;
      }
      if (!shouldDiscoverProviderWithOverride(defaultDiscoveryEnabled, providerDiscoveryConfig)) {
        logger.debug(`Provider ${providerName} model discovery disabled by configuration`);
        continue;
      }
      let baseURL;
      let displayName = providerName;
      if (p.options?.baseURL) {
        baseURL = normalizeProviderOriginForCache(p.options.baseURL);
      } else {
        continue;
      }
      const cacheConfig = providerDiscoveryConfig.cache;
      const cacheEnabled = cacheConfig?.enabled === true;
      const ttlSeconds = cacheConfig?.ttlSeconds ?? DEFAULT_CACHE_TTL_SECONDS;
      const cacheIdentity = {
        id: providerName,
        baseURL,
        endpoint: modelsEndpoint
      };
      let persistedState;
      let usingPersistedModels = false;
      let apiKey;
      let models = [];
      let discoveredModels = {};
      if (cacheEnabled) {
        persistedState = await currentProviderModelStore.read(cacheIdentity);
        if (persistedState && isInventoryFresh(persistedState, ttlSeconds)) {
          discoveredModels = persistedState.models;
          usingPersistedModels = true;
        } else {
          apiKey = await getProviderApiKey(providerName, p, client, resolvedProvidersLoader, logger);
          const discovery = await discoverModelsFromProvider(baseURL, apiKey, modelsEndpoint, timeoutMs);
          if (!discovery.ok) {
            const existingModels2 = getExplicitModels(config, providerName, p.models || {});
            p.models = existingModels2;
            replaceInjectedModels(config, providerName, {});
            logger.warn("Provider model discovery failed", {
              provider: providerName,
              baseURL,
              endpoint: modelsEndpoint
            });
            continue;
          }
          models = discovery.models.filter(isValidModel);
        }
      } else {
        apiKey = await getProviderApiKey(providerName, p, client, resolvedProvidersLoader, logger);
        const discovery = await discoverModelsFromProvider(baseURL, apiKey, modelsEndpoint, timeoutMs);
        if (!discovery.ok) {
          logger.warn("Provider model discovery failed", {
            provider: providerName,
            baseURL,
            endpoint: modelsEndpoint
          });
          continue;
        }
        models = discovery.models.filter(isValidModel);
      }
      let modelInfoEnricher;
      if (!usingPersistedModels && modelInfoFormat && !isSupportedModelInfoFormat(modelInfoFormat)) {
        logger.warn("Unsupported provider model info format", {
          provider: providerName,
          format: modelInfoFormat
        });
      } else if (!usingPersistedModels && modelInfoFormat === "models.dev" /* ModelsDev */) {
        const modelInfoEndpoint = providerDiscoveryConfig.modelInfoEndpoint ?? DEFAULT_MODELS_DEV_URL;
        const modelsDevCache = await fetchModelsDevData(modelInfoEndpoint);
        modelInfoEnricher = createModelInfoEnricher(modelInfoFormat, modelsDevCache, { filterNonChat });
        logger.info("Loaded models.dev data", {
          provider: providerName,
          endpoint: modelInfoEndpoint,
          count: modelsDevCache.size
        });
      } else if (!usingPersistedModels && (modelInfoFormat === "bifrost" /* Bifrost */ || modelInfoFormat === "llama-swap" /* LlamaSwap */ || modelInfoFormat === "omniroute" /* OmniRoute */ || modelInfoFormat === "vllm" /* VLLM */)) {
        modelInfoEnricher = createModelInfoEnricher(modelInfoFormat, null);
      } else if (!usingPersistedModels && modelInfoFormat === "lmstudio" /* LMStudio */) {
        const modelInfoEndpoint = providerDiscoveryConfig.modelInfoEndpoint ?? DEFAULT_LMSTUDIO_MODELS_ENDPOINT;
        const modelInfoDiscovery = await discoverModelInfoFromProvider(baseURL, apiKey, modelInfoEndpoint, timeoutMs);
        if (modelInfoDiscovery.ok) {
          modelInfoEnricher = createModelInfoEnricher(modelInfoFormat, modelInfoDiscovery.data);
        } else {
          logger.warn("Provider model info discovery failed", {
            provider: providerName,
            baseURL,
            endpoint: modelInfoEndpoint,
            format: modelInfoFormat
          });
        }
      } else if (!usingPersistedModels && modelInfoFormat === "litellm" /* LiteLLM */) {
        const modelInfoEndpoint = providerDiscoveryConfig.modelInfoEndpoint ?? DEFAULT_LITELLM_MODEL_INFO_ENDPOINT;
        const modelInfoDiscovery = await discoverModelInfoFromProvider(baseURL, apiKey, modelInfoEndpoint, timeoutMs);
        if (modelInfoDiscovery.ok) {
          modelInfoEnricher = createModelInfoEnricher(modelInfoFormat, modelInfoDiscovery.data, { filterNonChat });
        } else {
          logger.warn("Provider model info discovery failed", {
            provider: providerName,
            baseURL,
            endpoint: modelInfoEndpoint,
            format: modelInfoFormat
          });
        }
      }
      const existingModels = getExplicitModels(config, providerName, p.models || {});
      const hasProviderModelRegexFilter = !!providerDiscoveryConfig.models?.includeRegex?.length || !!providerDiscoveryConfig.models?.excludeRegex?.length;
      const providerModelRegexFilter = getProviderModelRegexFilter(providerDiscoveryConfig, logger.child({ category: "filtering" }));
      const providerModelFieldFilters = getProviderModelFieldFilters(providerDiscoveryConfig, logger.child({ category: "filtering" }));
      const smartModelNameEnabled = providerDiscoveryConfig.smartModelName === true;
      if (!usingPersistedModels) {
        for (const model of models) {
          const modelKey = model.id;
          if (!shouldDiscoverModelByFields(model, providerModelFieldFilters)) {
            continue;
          }
          if (hasProviderModelRegexFilter && !shouldDiscoverModel(model.id, providerModelRegexFilter)) {
            continue;
          }
          const modelType = categorizeModel(model.id);
          if (modelType === "embedding") {
            continue;
          }
          if (modelInfoEnricher?.shouldSkipModel(model.id)) {
            continue;
          }
          const owner = extractModelOwner(model.id);
          const modelConfig = {
            id: model.id,
            name: smartModelNameEnabled ? modelInfoEnricher?.getModelName?.(model.id, model) ?? formatModelName(model) : model.id
          };
          if (owner) {
            modelConfig.organizationOwner = owner;
          }
          if (modelType === "chat") {
            modelConfig.modalities = {
              input: ["text"],
              output: ["text"]
            };
          }
          modelInfoEnricher?.applyModelInfo(modelConfig, model.id, model);
          discoveredModels[modelKey] = modelConfig;
        }
      }
      if (smartModelNameEnabled) {
        disambiguateModelNames(Object.values(discoveredModels));
      }
      if (cacheEnabled && !usingPersistedModels && !await currentProviderModelStore.saveModels(cacheIdentity, discoveredModels, persistedState)) {
        logger.debug("Could not persist discovered provider models", { provider: providerName });
      }
      const modelsWithOverrides = Object.fromEntries(Object.entries(discoveredModels).map(([modelID, model]) => [
        modelID,
        mergeModelOverride(model, persistedState?.overrides?.[modelID])
      ]));
      const modelsWithExplicitConfig = Object.fromEntries(Object.entries(existingModels).map(([modelID, model]) => [
        modelID,
        modelID in modelsWithOverrides ? mergeModelOverride(modelsWithOverrides[modelID], model) : model
      ]));
      p.models = {
        ...modelsWithOverrides,
        ...modelsWithExplicitConfig
      };
      replaceInjectedModels(config, providerName, modelsWithOverrides);
      if (Object.keys(modelsWithOverrides).length > 0) {
        openAICompatibleProviders.push({
          name: displayName,
          baseURL,
          models: modelsWithOverrides
        });
      }
    }
    if (openAICompatibleProviders.length > 0) {
      const totalModels = openAICompatibleProviders.reduce((sum, p) => sum + Object.keys(p.models).length, 0);
      logger.info("Provider model discovery completed", {
        providerCount: openAICompatibleProviders.length,
        modelCount: totalModels
      });
    }
  } catch (error) {
    logger.error("Unexpected error in enhanceConfig", {
      error: error instanceof Error ? error.message : String(error)
    });
    toastNotifier.warning("Plugin configuration failed", "Configuration Error").catch(() => {
    });
  }
}
__name(enhanceConfig, "enhanceConfig");

// src/plugin/commands.ts
var MIGRATION_COMMAND_NAME = "models-discovery:migrate";
var CONFIG_COMMAND_NAME = "models-discovery:config";
var MIGRATION_COMMAND_TEMPLATE = `Use the customize-opencode skill.

Migrate opencode-models-discovery legacy global configuration to provider-level configuration.

Inspect both:
- the project OpenCode config: opencode.json, opencode.jsonc, or .opencode/opencode.json under the current project/worktree
- the user global OpenCode config: ~/.config/opencode/opencode.json

If OPENCODE_CONFIG is set and points to a file, inspect that custom config file too.

Do not edit managed or organization-controlled config unless the user explicitly asks for it. Managed config locations are platform-specific, including /Library/Application Support/opencode/ on macOS, /etc/opencode/ on Linux, and %ProgramData%\\opencode on Windows.

Find the OpenCode config file that declares the opencode-models-discovery plugin and also contains legacy plugin-level options for that plugin.

Legacy opencode-models-discovery options are:
- discovery.enabled
- providers.include
- providers.exclude
- models.includeRegex
- models.excludeRegex
- smartModelName

Move these settings into provider.<id>.options.modelsDiscovery where possible.

Field mapping:
- discovery.enabled -> provider.<id>.options.modelsDiscovery.enabled only when needed to preserve behavior
- models.includeRegex -> preferably provider.<id>.options.modelsDiscovery.models.includeBy with { "field": "id", "match": "..." }
- models.excludeRegex -> preferably provider.<id>.options.modelsDiscovery.models.excludeBy with { "field": "id", "match": "..." }
- smartModelName -> provider.<id>.options.modelsDiscovery.smartModelName
- providers.exclude -> provider.<id>.options.modelsDiscovery.enabled=false for excluded editable providers

Provider-level models.includeRegex and models.excludeRegex remain supported as id-only shortcuts, but prefer includeBy and excludeBy for migrated config because they support both id filters and provider-specific raw fields.

Preserve unrelated config fields and formatting as much as possible.
Do not modify files that do not declare this plugin.
Do not guess provider IDs that are not present in editable config.
Do not overwrite existing provider.<id>.options.modelsDiscovery fields unless the user explicitly asks you to.
If migration cannot be done safely, explain what blocked it and show the exact manual changes needed.

Explain the mechanism to the user before or after editing:
- OpenCode's provider config defines the provider id, npm package, baseURL, API key source, and built-in provider enablement.
- This plugin only discovers and injects models for providers; it does not enable a provider that OpenCode itself has disabled.
- OpenCode built-in enabled_providers and disabled_providers control provider availability, while modelsDiscovery controls only model discovery for an available provider.
- API keys can remain in provider.<id>.options.apiKey or in OpenCode /connect credentials; do not duplicate secrets unless the user asks.
- After v1.0.0, provider-level modelsDiscovery is the configuration boundary for this plugin.

For v1.0.0 behavior:
- plugin-level global discovery config is no longer applied
- discovery remains enabled by default
- provider.<id>.options.modelsDiscovery.enabled=false disables discovery for that provider
- OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED=false can be used to make unspecified providers default to disabled

If providers.include is used, preserve the old opt-in behavior by either recommending OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED=false with explicit enabled providers, or disabling known non-included editable providers with modelsDiscovery.enabled=false. Prefer explaining the environment variable approach instead of writing many disable entries unless the user asks for a pure config-only migration.

After editing config, remind the user to quit and restart opencode.`;
var CONFIG_COMMAND_TEMPLATE = `Use the customize-opencode skill.

Help configure opencode-models-discovery using the recommended provider-level configuration style.

Inspect both:
- the project OpenCode config: opencode.json, opencode.jsonc, or .opencode/opencode.json under the current project/worktree
- the user global OpenCode config: ~/.config/opencode/opencode.json

If OPENCODE_CONFIG is set and points to a file, inspect that custom config file too.

Do not edit managed or organization-controlled config unless the user explicitly asks for it. Managed config locations are platform-specific, including /Library/Application Support/opencode/ on macOS, /etc/opencode/ on Linux, and %ProgramData%\\opencode on Windows.

Find the OpenCode config file that declares the opencode-models-discovery plugin, or ask the user whether the plugin should be added to project or user global config if it is not configured yet.

Use provider-level configuration under provider.<id>.options.modelsDiscovery. Prefer this shape:

{
  "provider": {
    "<provider-id>": {
      "options": {
        "modelsDiscovery": {
          "enabled": true,
          "endpoint": "/v1/models",
          "models": {
            "includeBy": [{ "field": "id", "match": "^chat-" }],
            "excludeBy": [{ "field": "available", "equals": false }]
          },
          "smartModelName": true,
          "modelInfoFormat": "litellm",
          "filterNonChat": true,
          "cache": {
            "enabled": true,
            "ttlSeconds": 86400
          }
        }
      }
    }
  }
}

Only include fields the user needs. Do not add placeholder regex values.

Explain the mechanism to the user:
- OpenCode's provider config defines the provider id, npm package, baseURL, API key source, and built-in provider enablement.
- This plugin runs during OpenCode startup, queries a provider's models endpoint, and merges discovered models into the active config for the current session.
- OpenCode built-in enabled_providers and disabled_providers control whether providers are available at all.
- provider.<id>.options.modelsDiscovery controls only discovery behavior for that provider.
- API keys can be configured as provider.<id>.options.apiKey, but OpenCode /connect credentials can also be used for the same provider id. Do not duplicate secrets unless the user asks.
- Config changes require restarting OpenCode because config is loaded at startup.

Supported plugin options under provider.<id>.options.modelsDiscovery:
- enabled: force enable or disable discovery for this provider
- endpoint: provider-specific models endpoint as an origin-relative path beginning with /; it always uses the provider base URL origin and defaults to /v1/models
- modelInfoEndpoint: override the metadata endpoint; accepts either an origin-relative path or a complete URL for "litellm" and "lmstudio", while "models.dev" requires a complete models.json URL
- models.includeRegex: shortcut for model id regex allow-list; prefer models.includeBy with field="id" and match for new config
- models.excludeRegex: shortcut for model id regex deny-list; prefer models.excludeBy with field="id" and match for new config
- models.includeBy: allow-list for top-level raw fields returned in the provider's /v1/models response; each rule uses exactly one of equals or match
- models.excludeBy: deny-list for top-level raw fields returned in the provider's /v1/models response; each rule uses exactly one of equals or match
- smartModelName: use friendlier display names for discovered models
- modelInfoFormat="models.dev": enrich from the public models.dev index; modelInfoEndpoint optionally overrides the complete models.json URL
- modelInfoFormat="bifrost": read Bifrost's documented inline /v1/models limits, modalities, and base pricing without another request
- modelInfoFormat="litellm": enrich from a LiteLLM-compatible /v1/model/info endpoint; modelInfoEndpoint optionally overrides the path
- modelInfoFormat="vllm": for vLLM-compatible providers whose raw /v1/models entries include a positive numeric max_model_len; without another request, sets limit.context and limit.output for matching discovered models
- modelInfoFormat="lmstudio": discover callable models through the normal /v1/models endpoint, then enrich exact model-id matches from LM Studio's /api/v1/models inventory
- modelInfoFormat="llama-swap": read llama-swap's inline /v1/models context, modalities, and function-calling metadata without another request
- modelInfoFormat="omniroute": read OmniRoute's documented inline /v1/models limits, modalities, and capabilities without another request
- filterNonChat: when LiteLLM model info is available, skip non-chat models by default
- cache.enabled: opt in to a provider-scoped persisted discovery cache of filtered and enriched model configurations; defaults to false
- cache.ttlSeconds: non-negative finite cache lifetime in seconds; defaults to 86400

Recommended defaults:
- omit modelsDiscovery.enabled when the user is fine with discovery defaulting on
- set modelsDiscovery.enabled=false to disable discovery for a specific provider
- omit endpoint when the provider uses the standard /v1/models endpoint
- prefer models.includeBy and models.excludeBy for model filtering
- use models.includeBy or models.excludeBy with field="id" and match for id/name regex filtering
- use models.includeBy or models.excludeBy with equals for strict equality on provider-specific top-level raw model fields
- use models.includeBy or models.excludeBy with match for regex matching on string top-level raw model fields
- treat models.includeRegex and models.excludeRegex as id-only shortcuts for includeBy/excludeBy; do not recommend them for new config unless the user asks for the shorter id-only syntax
- missing fields do not match includeBy or excludeBy rules
- includeBy and excludeBy are cumulative: a model must pass includeBy first, then excludeBy
- excludeBy wins over includeBy when both match the same model
- includeRegex and excludeRegex preserve legacy shortcut behavior: includeRegex takes precedence, so excludeRegex is only applied when includeRegex is not configured
- avoid configuring both includeBy field="id" match rules and includeRegex unless the user wants an intersection with legacy id-only shortcut behavior
- use smartModelName=true only when the user wants friendlier display names
- use modelInfoFormat="models.dev" for models.dev metadata enrichment; set modelInfoEndpoint to a complete mirror or proxy URL only when needed
- use modelInfoFormat="bifrost" only for Bifrost /v1/models responses; it is an explicit inline-metadata format and does not make another request
- use modelInfoFormat="litellm" for LiteLLM-compatible /v1/model/info; set modelInfoEndpoint only when the provider uses another path
- use modelInfoFormat="vllm" only when the provider's /v1/models response exposes max_model_len; it is not a standard OpenAI-compatible field, does not require modelInfoEndpoint, and does not infer other capabilities
- use modelInfoFormat="lmstudio" for LM Studio REST metadata enrichment; set modelInfoEndpoint only when LM Studio uses another inventory path
- use modelInfoFormat="llama-swap" only for llama-swap /v1/models responses; it is an explicit inline-metadata format and does not make another request
- use modelInfoFormat="omniroute" only for OmniRoute's documented /v1/models response; it is an explicit inline-metadata format and does not make another request
- configure caching only when the user requests it; it is disabled by default
- the persisted discovery cache belongs to this plugin and is not a replacement for opencode.json

When the user asks to manage the persisted discovery cache:
- identify the selected provider from editable OpenCode configuration, then resolve the plugin data directory with xdg-basedir (XDG_DATA_HOME when set, otherwise its platform fallback) and inspect only opencode-models-discovery/providers/provider-<encoded-provider-id>.json beneath it
- before editing, show cached models, last successful fetch time, cache TTL validity, and existing overrides
- model overrides are provider-owned configuration fragments applied only while that model exists in the current valid cached model set; an override for a missing model remains saved but inactive until the provider returns it
- ask for confirmation before removing an override or invalidating/removing cached models
- for a force refresh, invalidate or remove only the cached discovered models and preserve overrides
- never edit OpenCode or Mimocode auth stores, API keys, authorization headers, or managed host configuration while managing saved state

Provider compatibility guidance:
- Discovery works for @ai-sdk/openai-compatible providers by default.
- Providers with a /v1 baseURL can often be discovered even when using another npm package.
- Providers with non-standard models paths should set modelsDiscovery.endpoint.
- modelsDiscovery.enabled=true can force discovery for a provider that does not match automatic compatibility detection.

Configuration compatibility boundary:
- v1.0.0 ignores plugin-level global discovery config at runtime.
- Recommended new config should use provider.<id>.options.modelsDiscovery.
- Discovery remains enabled by default unless a provider sets modelsDiscovery.enabled=false or OPENCODE_MODELS_DISCOVERY_DEFAULT_ENABLED=false is set for unspecified providers.

Preserve unrelated config fields and formatting as much as possible.
Do not overwrite existing provider.<id>.options.modelsDiscovery fields unless the user explicitly asks you to.
After editing config, remind the user to quit and restart opencode.`;
function ensureCommandConfig(config) {
  if (!config || typeof config !== "object") {
    return void 0;
  }
  if (!config.command || typeof config.command !== "object" || Array.isArray(config.command)) {
    config.command = {};
  }
  return config.command;
}
__name(ensureCommandConfig, "ensureCommandConfig");
function injectCommand(config, logger, commandName, command, existingMessage) {
  const commands = ensureCommandConfig(config);
  if (!commands) {
    return;
  }
  if (commands[commandName]) {
    logger.warn(existingMessage, {
      command: commandName
    });
    return;
  }
  commands[commandName] = command;
}
__name(injectCommand, "injectCommand");
function injectMigrationCommand(config, logger) {
  injectCommand(
    config,
    logger,
    MIGRATION_COMMAND_NAME,
    {
      description: "Migrate opencode-models-discovery config",
      agent: "build",
      template: MIGRATION_COMMAND_TEMPLATE
    },
    "Migration command already exists; leaving user-defined command unchanged"
  );
}
__name(injectMigrationCommand, "injectMigrationCommand");
function injectConfigCommand(config, logger) {
  injectCommand(
    config,
    logger,
    CONFIG_COMMAND_NAME,
    {
      description: "Configure opencode-models-discovery",
      agent: "build",
      template: CONFIG_COMMAND_TEMPLATE
    },
    "Config command already exists; leaving user-defined command unchanged"
  );
}
__name(injectConfigCommand, "injectConfigCommand");

// src/plugin/config-hook.ts
var DEFAULT_CONFIG_HOOK_TIMEOUT_MS = 5e3;
function getConfigHookTimeoutMs(config, logger) {
  const providerTimeouts = Object.values(config?.provider ?? {}).map((provider) => provider?.options?.modelsDiscovery?.timeoutMs).filter((timeoutMs2) => typeof timeoutMs2 === "number" && Number.isFinite(timeoutMs2) && timeoutMs2 > 0);
  const providerTimeoutMs = providerTimeouts.length > 0 ? Math.max(...providerTimeouts) : void 0;
  const timeoutMs = Math.max(DEFAULT_CONFIG_HOOK_TIMEOUT_MS, providerTimeoutMs ?? 0);
  logger.debug("Using config hook timeout", { timeoutMs, providerTimeoutMs });
  return timeoutMs;
}
__name(getConfigHookTimeoutMs, "getConfigHookTimeoutMs");
function createConfigHook(client, toastNotifier, pluginConfig, legacyGlobalConfigWarning, logger) {
  return async (config) => {
    if (config && (Object.isFrozen?.(config) || Object.isSealed?.(config))) {
      logger.warn("Config object is frozen or sealed; cannot modify directly");
      return;
    }
    const validation = validateConfig(config);
    if (!validation.isValid) {
      logger.error("Invalid config provided", { errors: validation.errors });
      toastNotifier.error("Plugin configuration is invalid", "Configuration Error").catch(() => {
      });
      return;
    }
    if (validation.warnings.length > 0) {
      logger.warn("Config warnings", { warnings: validation.warnings });
    }
    injectConfigCommand(config, logger);
    if (hasLegacyGlobalDiscoveryConfig(pluginConfig)) {
      legacyGlobalConfigWarning.markPending(logger);
      injectMigrationCommand(config, logger);
    }
    const discoveryPromise = enhanceConfig(
      config,
      client,
      toastNotifier,
      pluginConfig,
      logger.child({ category: "discovery" })
    );
    const timeoutMs = getConfigHookTimeoutMs(config, logger);
    try {
      await Promise.race([
        discoveryPromise,
        new Promise((resolve) => {
          setTimeout(() => resolve(), timeoutMs);
        })
      ]);
    } catch (error) {
      logger.error("Config enhancement failed", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}
__name(createConfigHook, "createConfigHook");

// src/plugin/legacy-config-warning.ts
var LEGACY_GLOBAL_CONFIG_WARNING = "Global opencode-models-discovery config is no longer applied in v1.0.0. Move settings to provider.<name>.options.modelsDiscovery or run /models-discovery:migrate.";
var TOAST_RETRY_DELAYS_MS = [500, 1500, 3e3, 5e3];
var TOAST_READY_EVENTS = /* @__PURE__ */ new Set([
  "server.connected",
  "workspace.ready",
  "worktree.ready",
  "reference.updated"
]);
function isToastReadyEvent(event) {
  return typeof event?.type === "string" && TOAST_READY_EVENTS.has(event.type);
}
__name(isToastReadyEvent, "isToastReadyEvent");
function createLegacyGlobalConfigWarningController() {
  let pending = false;
  let logged = false;
  let retryStarted = false;
  return {
    markPending(logger) {
      if (pending) {
        return;
      }
      pending = true;
      if (!logged) {
        logged = true;
        logger.warn("Legacy global opencode-models-discovery config was detected but is ignored in v1.0.0. Use provider.<name>.options.modelsDiscovery instead.", {
          migrationCommand: "/models-discovery:migrate",
          ignoredSince: "v1.0.0"
        });
      }
    },
    startRetries(toastNotifier) {
      if (!pending || retryStarted) {
        return;
      }
      retryStarted = true;
      const runAttempt = /* @__PURE__ */ __name((index) => {
        const delayMs = TOAST_RETRY_DELAYS_MS[index];
        const timer = setTimeout(() => {
          if (!pending) {
            return;
          }
          toastNotifier.warning(LEGACY_GLOBAL_CONFIG_WARNING, "Discovery Config Migration", 8e3).catch(() => {
          });
          if (index + 1 < TOAST_RETRY_DELAYS_MS.length) {
            runAttempt(index + 1);
            return;
          }
          pending = false;
        }, delayMs);
        timer.unref?.();
      }, "runAttempt");
      runAttempt(0);
    }
  };
}
__name(createLegacyGlobalConfigWarningController, "createLegacyGlobalConfigWarningController");

// src/plugin/event-hook.ts
function createEventHook(toastNotifier, legacyGlobalConfigWarning, logger) {
  return async ({ event }) => {
    const validation = validateHookInput("event", { event });
    if (!validation.isValid) {
      logger.error("Invalid event input", { errors: validation.errors });
      return;
    }
    if (isToastReadyEvent(event)) {
      legacyGlobalConfigWarning.startRetries(toastNotifier);
      return;
    }
    if (event.type === "session.created" || event.type === "session.updated") {
    }
  };
}
__name(createEventHook, "createEventHook");

// src/plugin/logger.ts
var SERVICE_NAME = "opencode-models-discovery";
function getConsoleMethod(level) {
  if (level === "error") {
    return console.error;
  }
  if (level === "warn") {
    return console.warn;
  }
  if (level === "debug") {
    return console.debug;
  }
  return console.info;
}
__name(getConsoleMethod, "getConsoleMethod");
function mergeExtra(baseExtra, extra) {
  const merged = {
    ...baseExtra,
    ...extra
  };
  return Object.keys(merged).length > 0 ? merged : void 0;
}
__name(mergeExtra, "mergeExtra");
function fallbackToConsole(level, message, extra) {
  const log = getConsoleMethod(level);
  const prefix = `[${SERVICE_NAME}] ${message}`;
  if (extra && Object.keys(extra).length > 0) {
    log(prefix, extra);
    return;
  }
  log(prefix);
}
__name(fallbackToConsole, "fallbackToConsole");
function createPluginLogger(client, baseExtra = {}) {
  const log = /* @__PURE__ */ __name((level, message, extra) => {
    const mergedExtra = mergeExtra(baseExtra, extra);
    try {
      if (client?.app?.log) {
        void client.app.log({
          body: {
            service: SERVICE_NAME,
            level,
            message,
            extra: mergedExtra
          }
        }).catch(() => {
          fallbackToConsole(level, message, mergedExtra);
        });
        return;
      }
    } catch {
    }
    fallbackToConsole(level, message, mergedExtra);
  }, "log");
  return {
    debug(message, extra) {
      log("debug", message, extra);
    },
    info(message, extra) {
      log("info", message, extra);
    },
    warn(message, extra) {
      log("warn", message, extra);
    },
    error(message, extra) {
      log("error", message, extra);
    },
    child(extra) {
      return createPluginLogger(client, mergeExtra(baseExtra, extra) || {});
    }
  };
}
__name(createPluginLogger, "createPluginLogger");

// src/plugin/index.ts
var ModelDiscoveryPlugin = /* @__PURE__ */ __name(async (input, options) => {
  const { client } = input;
  const logger = createPluginLogger(client, { category: "plugin" });
  if (!client || typeof client !== "object") {
    logger.error("Invalid client provided to plugin");
    return {
      config: /* @__PURE__ */ __name(async () => {
      }, "config"),
      event: /* @__PURE__ */ __name(async () => {
      }, "event")
    };
  }
  logger.info("Model discovery plugin initialized");
  const pluginConfig = parsePluginConfig(options || {});
  if (pluginConfig.discovery?.enabled === false) {
    logger.info("Discovery disabled by configuration", { category: "config" });
  }
  const toastNotifier = new ToastNotifier(client);
  const legacyGlobalConfigWarning = createLegacyGlobalConfigWarningController();
  return {
    config: createConfigHook(client, toastNotifier, pluginConfig, legacyGlobalConfigWarning, logger.child({ category: "config" })),
    event: createEventHook(toastNotifier, legacyGlobalConfigWarning, logger.child({ category: "event" }))
  };
}, "ModelDiscoveryPlugin");

// src/v2/index.ts
import { Plugin } from "@opencode/plugin";

// src/v2/catalog.ts
import { Model, Provider } from "@opencode/plugin";
function copyInventory(inventory) {
  return new Map([...inventory].map(([providerID, models]) => [providerID, new Map(models)]));
}
__name(copyInventory, "copyInventory");
function createProviderController(ctx, configured, integrationID2) {
  let inventory = /* @__PURE__ */ new Map();
  const transform = /* @__PURE__ */ __name((editor) => {
    for (const provider of configured) {
      const providerID = Provider.ID.make(provider.id);
      const current = editor.get(providerID);
      if (!current) {
        editor.add({
          info: {
            ...Provider.Info.empty(providerID),
            name: provider.name ?? provider.id,
            package: provider.package,
            settings: provider.settings,
            integrationID: integrationID2(provider.id),
            activation: "enabled"
          },
          models: []
        });
      }
      const models = inventory.get(provider.id);
      if (!models) continue;
      const source = editor.get(providerID);
      const existing = source ? [...source.models.values()] : [];
      const existingIDs = new Set(existing.map((model) => String(model.id)));
      editor.models.set(providerID, [
        ...existing,
        ...[...models.values()].filter((model) => !existingIDs.has(model.id)).map((model) => Object.assign(
          Model.Info.default(providerID, Model.ID.make(model.modelID)),
          model
        ))
      ]);
    }
  }, "transform");
  return {
    transform,
    async replaceInventory(next) {
      inventory = copyInventory(next);
      await ctx.provider.reload();
    },
    status() {
      return {
        providers: inventory.size,
        models: [...inventory.values()].reduce((total, models) => total + models.size, 0)
      };
    }
  };
}
__name(createProviderController, "createProviderController");

// src/v2/model-mapper.ts
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function mapV1Variant(id, value) {
  if (!isRecord(value)) return { id, settings: {} };
  const settings = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "settings" || key === "body" || key === "headers") continue;
    settings[key] = item;
  }
  if (isRecord(value.settings)) Object.assign(settings, value.settings);
  const headers = isRecord(value.headers) ? Object.fromEntries(
    Object.entries(value.headers).filter((entry) => typeof entry[1] === "string")
  ) : void 0;
  return {
    id,
    settings,
    ...isRecord(value.body) ? { body: value.body } : {},
    ...headers && Object.keys(headers).length > 0 ? { headers } : {}
  };
}
__name(mapV1Variant, "mapV1Variant");
function resolveModelName(model, options, enricher) {
  if (!options.smartModelName) {
    return model.id;
  }
  return enricher?.getModelName?.(model.id, model) ?? formatModelName(model);
}
__name(resolveModelName, "resolveModelName");
function mapToDiscoveredV2Model(model, options, enricher) {
  const intermediateV1 = {
    id: model.id,
    name: resolveModelName(model, options, enricher),
    capabilities: {
      tools: true,
      input: ["text"],
      output: ["text"]
    },
    limit: {
      context: 2e5,
      output: 32e3
    }
  };
  enricher?.applyModelInfo(intermediateV1, model.id, model);
  const name = typeof intermediateV1.name === "string" && intermediateV1.name.length > 0 ? intermediateV1.name : model.id;
  const capabilities = {
    tools: intermediateV1.tool_call !== false && intermediateV1.capabilities?.tools !== false
  };
  const inputModalities = intermediateV1.modalities?.input ?? intermediateV1.capabilities?.input ?? ["text"];
  if (Array.isArray(inputModalities) && inputModalities.length > 0) {
    capabilities.input = inputModalities;
  }
  const outputModalities = intermediateV1.modalities?.output ?? intermediateV1.capabilities?.output ?? ["text"];
  if (Array.isArray(outputModalities) && outputModalities.length > 0) {
    capabilities.output = outputModalities;
  }
  const limit = {};
  const rawLimit = intermediateV1.limit ?? {};
  if (typeof rawLimit.context === "number" && rawLimit.context > 0) {
    limit.context = rawLimit.context;
  } else {
    limit.context = 2e5;
  }
  if (typeof rawLimit.output === "number" && rawLimit.output > 0) {
    limit.output = rawLimit.output;
  } else {
    limit.output = 32e3;
  }
  if (typeof rawLimit.input === "number" && rawLimit.input > 0) {
    limit.input = rawLimit.input;
  }
  const result = {
    id: model.id,
    modelID: model.id,
    name,
    capabilities,
    limit
  };
  const isReasoning = typeof intermediateV1.reasoning === "boolean" ? intermediateV1.reasoning : model.supports_reasoning === true || model.capabilities && typeof model.capabilities === "object" && model.capabilities.reasoning === true || /(?:^|[-_/])(r1|reasoner|thinking|reasoning)(?:[-_/]|$)/i.test(model.id);
  if (isReasoning) {
    result.reasoning = true;
    result.compatibility = {
      ...result.compatibility,
      reasoningField: "reasoning_content"
    };
  }
  if (Array.isArray(intermediateV1.variants)) {
    result.variants = intermediateV1.variants;
  } else if (intermediateV1.variants && typeof intermediateV1.variants === "object") {
    result.variants = Object.entries(intermediateV1.variants).map(([id, value]) => mapV1Variant(id, value));
  } else if (isReasoning && !result.variants) {
    result.variants = [
      { id: "low", settings: { reasoningEffort: "low" } },
      { id: "medium", settings: { reasoningEffort: "medium" } },
      { id: "high", settings: { reasoningEffort: "high" } }
    ];
  }
  if (typeof intermediateV1.attachment === "boolean") {
    result.attachment = intermediateV1.attachment;
  }
  if (intermediateV1.cost && typeof intermediateV1.cost === "object") {
    if (Array.isArray(intermediateV1.cost)) {
      result.cost = intermediateV1.cost;
    } else {
      result.cost = [
        {
          input: intermediateV1.cost.input ?? 0,
          output: intermediateV1.cost.output ?? 0,
          cache: {
            read: intermediateV1.cost.cache_read ?? intermediateV1.cost.cache?.read ?? 0,
            write: intermediateV1.cost.cache_write ?? intermediateV1.cost.cache?.write ?? 0
          }
        }
      ];
    }
  }
  return result;
}
__name(mapToDiscoveredV2Model, "mapToDiscoveredV2Model");

// src/v2/discovery.ts
function matchesFieldFilter(model, filter) {
  const value = model[filter.field];
  if (filter.match !== void 0) return typeof value === "string" && new RegExp(filter.match).test(value);
  return value === filter.equals;
}
__name(matchesFieldFilter, "matchesFieldFilter");
function included(model, config) {
  if (config.includeBy.length > 0 && !config.includeBy.some((filter) => matchesFieldFilter(model, filter))) return false;
  if (config.excludeBy.some((filter) => matchesFieldFilter(model, filter))) return false;
  if (config.includeRegex.length > 0 && !config.includeRegex.some((filter) => filter.test(model.id))) return false;
  return !config.excludeRegex.some((filter) => filter.test(model.id));
}
__name(included, "included");
var DEFAULT_LITELLM_ENDPOINT = "/v1/model/info";
var DEFAULT_LMSTUDIO_ENDPOINT = "/api/v1/models";
async function resolveModelInfoEnricher(baseURL, apiKey, config, fetcher) {
  const format = config.modelInfoFormat;
  if (!format) return void 0;
  if (format === "models.dev" /* ModelsDev */) {
    const endpoint = config.modelInfoEndpoint ?? DEFAULT_MODELS_DEV_URL;
    const data = await fetchModelsDevData(endpoint);
    return createModelInfoEnricher(format, data, { filterNonChat: config.filterNonChat });
  }
  if (format === "bifrost" /* Bifrost */ || format === "vllm" /* VLLM */ || format === "llama-swap" /* LlamaSwap */ || format === "omniroute" /* OmniRoute */) {
    return createModelInfoEnricher(format, null);
  }
  if (format === "litellm" /* LiteLLM */ || format === "lmstudio" /* LMStudio */) {
    const defaultEndpoint = format === "litellm" /* LiteLLM */ ? DEFAULT_LITELLM_ENDPOINT : DEFAULT_LMSTUDIO_ENDPOINT;
    const targetEndpoint = config.modelInfoEndpoint ?? defaultEndpoint;
    const infoUrl = /^https?:\/\//i.test(targetEndpoint) ? targetEndpoint : targetEndpoint.startsWith("/") ? new URL(targetEndpoint, new URL(baseURL).origin).toString() : new URL(targetEndpoint, baseURL.endsWith("/") ? baseURL : `${baseURL}/`).toString();
    const headers = new Headers({ accept: "application/json" });
    if (apiKey) headers.set("authorization", `Bearer ${apiKey}`);
    try {
      const res = await fetcher(infoUrl, {
        headers,
        signal: AbortSignal.timeout(config.timeoutMs)
      });
      if (res.ok) {
        const data = await res.json();
        return createModelInfoEnricher(format, data, { filterNonChat: config.filterNonChat });
      }
    } catch {
    }
  }
  return void 0;
}
__name(resolveModelInfoEnricher, "resolveModelInfoEnricher");
async function discoverInventory(providers, discovery, fetcher = fetch) {
  const inventory = /* @__PURE__ */ new Map();
  await Promise.all(providers.map(async (provider) => {
    const config = discovery.get(provider.id);
    if (!config) return;
    const baseURL = typeof provider.settings.baseURL === "string" ? provider.settings.baseURL : void 0;
    if (!baseURL) return;
    const resolvedApiKey = typeof provider.apiKey === "string" && provider.apiKey.trim().length > 0 ? provider.apiKey.trim() : typeof provider.settings.apiKey === "string" && provider.settings.apiKey.trim().length > 0 ? provider.settings.apiKey.trim() : void 0;
    const url = new URL(config.endpoint, new URL(baseURL).origin).toString();
    const headers = new Headers({ accept: "application/json" });
    if (resolvedApiKey) headers.set("authorization", `Bearer ${resolvedApiKey}`);
    try {
      const [modelsResponse, enricher] = await Promise.all([
        fetcher(url, {
          headers,
          signal: AbortSignal.timeout(config.timeoutMs)
        }),
        resolveModelInfoEnricher(baseURL, resolvedApiKey, config, fetcher)
      ]);
      if (!modelsResponse.ok) return;
      const payload = await modelsResponse.json();
      if (!Array.isArray(payload?.data)) return;
      const models = /* @__PURE__ */ new Map();
      for (const entry of payload.data) {
        if (!entry || typeof entry !== "object" || typeof entry.id !== "string") continue;
        const candidate = entry;
        if (!included(candidate, config)) continue;
        if (enricher?.shouldSkipModel(candidate.id)) continue;
        models.set(candidate.id, mapToDiscoveredV2Model(candidate, config, enricher));
      }
      if (config.smartModelName) {
        disambiguateModelNames([...models.values()]);
      }
      inventory.set(provider.id, models);
    } catch {
    }
  }));
  return inventory;
}
__name(discoverInventory, "discoverInventory");

// src/v2/provider-config.ts
function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
__name(object, "object");
function regexes(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((pattern) => {
    if (typeof pattern !== "string") return [];
    try {
      return [new RegExp(pattern)];
    } catch {
      return [];
    }
  });
}
__name(regexes, "regexes");
function filters(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const filter of value) {
    const entry = object(filter);
    if (!entry || typeof entry.field !== "string") continue;
    if (typeof entry.match === "string") {
      try {
        new RegExp(entry.match);
        result.push({ field: entry.field, match: entry.match });
      } catch {
        continue;
      }
      continue;
    }
    if (entry.equals === null || ["string", "number", "boolean"].includes(typeof entry.equals)) {
      result.push({ field: entry.field, equals: entry.equals });
    }
  }
  return result;
}
__name(filters, "filters");
function isModelInfoFormat(value) {
  return Object.values(ModelInfoFormat).includes(value);
}
__name(isModelInfoFormat, "isModelInfoFormat");
function parseProviderDiscoveryOptions(raw) {
  const value = object(raw);
  if (!value) return void 0;
  if (value.enabled !== true) return void 0;
  const models = object(value.models);
  const endpoint = typeof value.endpoint === "string" && value.endpoint.startsWith("/") ? value.endpoint : "/v1/models";
  const timeoutMs = typeof value.timeoutMs === "number" && Number.isFinite(value.timeoutMs) && value.timeoutMs > 0 ? Math.max(1e3, Math.floor(value.timeoutMs)) : 5e3;
  const modelInfoFormat = isModelInfoFormat(value.modelInfoFormat) ? value.modelInfoFormat : void 0;
  const modelInfoEndpoint = typeof value.modelInfoEndpoint === "string" && value.modelInfoEndpoint.trim().length > 0 ? value.modelInfoEndpoint.trim() : void 0;
  const filterNonChat = typeof value.filterNonChat === "boolean" ? value.filterNonChat : true;
  return {
    enabled: true,
    endpoint,
    timeoutMs,
    includeRegex: regexes(models?.includeRegex),
    excludeRegex: regexes(models?.excludeRegex),
    includeBy: filters(models?.includeBy),
    excludeBy: filters(models?.excludeBy),
    smartModelName: value.smartModelName === true,
    modelInfoFormat,
    modelInfoEndpoint,
    filterNonChat
  };
}
__name(parseProviderDiscoveryOptions, "parseProviderDiscoveryOptions");

// src/v2/tools.ts
var noInput = {
  type: "object",
  properties: {},
  additionalProperties: false
};
async function registerDiscoveryTools(ctx, refresh, status) {
  await ctx.tool.transform((tools) => {
    tools.add({
      name: "models_discovery_refresh",
      description: "Refresh models discovered from configured OpenAI-compatible providers.",
      input: noInput,
      execute: /* @__PURE__ */ __name(async () => {
        const result = await refresh();
        return { content: `Discovered ${result.models} models from ${result.providers} providers.` };
      }, "execute")
    });
    tools.add({
      name: "models_discovery_status",
      description: "Show the current OpenAI-compatible model discovery inventory.",
      input: noInput,
      execute: /* @__PURE__ */ __name(async () => {
        const result = status();
        return { content: `Current discovery inventory has ${result.models} models from ${result.providers} providers.` };
      }, "execute")
    });
  });
}
__name(registerDiscoveryTools, "registerDiscoveryTools");

// src/v2/index.ts
var integrationPrefix = "opencode.models-discovery";
function integrationID(providerID) {
  return `${integrationPrefix}.${providerID}`;
}
__name(integrationID, "integrationID");
function providerList(value) {
  const entries = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray(value.data) ? value.data : [];
  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry;
    const provider = record.provider && typeof record.provider === "object" ? record.provider : entry;
    return [provider];
  });
}
__name(providerList, "providerList");
async function configuredProviders(ctx) {
  const fromList = /* @__PURE__ */ __name((listed) => {
    const providers = [];
    const discovery = /* @__PURE__ */ new Map();
    for (const entry of listed) {
      if (typeof entry.id !== "string" || typeof entry.package !== "string") continue;
      if (!entry.settings || typeof entry.settings !== "object" || Array.isArray(entry.settings)) continue;
      const settings = entry.settings;
      const parsed = parseProviderDiscoveryOptions(settings.modelsDiscovery);
      if (!parsed) continue;
      providers.push({
        id: entry.id,
        name: typeof entry.name === "string" ? entry.name : void 0,
        package: entry.package,
        settings
      });
      discovery.set(entry.id, parsed);
    }
    return { providers, discovery };
  }, "fromList");
  try {
    let configured = fromList(providerList(await ctx.provider.list()));
    if (configured.providers.length === 0) {
      await ctx.provider.reload();
      configured = fromList(providerList(await ctx.provider.list()));
    }
    if (configured.providers.length > 0) return configured;
  } catch {
  }
  return { providers: [], discovery: /* @__PURE__ */ new Map() };
}
__name(configuredProviders, "configuredProviders");
async function resolveProviderCredentials(ctx, providers) {
  return Promise.all(providers.map(async (provider) => {
    try {
      const connection = await ctx.integration.connection.active(integrationID(provider.id));
      const credential = connection ? await ctx.integration.connection.resolve(connection) : void 0;
      if (credential?.type === "key") return { ...provider, apiKey: credential.key };
    } catch {
    }
    return provider;
  }));
}
__name(resolveProviderCredentials, "resolveProviderCredentials");
async function setupV2(ctx) {
  const providers = [];
  const discovery = /* @__PURE__ */ new Map();
  const controller = createProviderController(ctx, providers, integrationID);
  const syncConfiguredProviders = /* @__PURE__ */ __name(async () => {
    const configured = await configuredProviders(ctx);
    if (configured.providers.length === 0) return false;
    providers.splice(0, providers.length, ...configured.providers);
    discovery.clear();
    for (const [id, options] of configured.discovery) discovery.set(id, options);
    const integrations = providers.map((provider) => ({ id: integrationID(provider.id), name: provider.name ?? provider.id }));
    await ctx.integration.transform((draft) => {
      for (const integration of integrations) {
        draft.update(integration.id, (current) => {
          current.id = integration.id;
          current.name = integration.name;
        });
        draft.method.update({
          integrationID: integration.id,
          method: { type: "key", label: "API key" }
        });
      }
    });
    await ctx.provider.transform(controller.transform);
    return true;
  }, "syncConfiguredProviders");
  await syncConfiguredProviders();
  let refreshChain = Promise.resolve();
  const refresh = /* @__PURE__ */ __name(() => {
    const run = refreshChain.then(async () => {
      const integrations = providers.map((provider) => integrationID(provider.id));
      if (integrations.length > 0) await ctx.integration.reload();
      const resolved = await resolveProviderCredentials(ctx, providers);
      const inventory = await discoverInventory(resolved, discovery);
      await controller.replaceInventory(inventory);
      return controller.status();
    });
    refreshChain = run.then(() => void 0, () => void 0);
    return run;
  }, "refresh");
  await registerDiscoveryTools(ctx, refresh, controller.status);
  await refresh();
  const abort = new AbortController();
  if (providers.length === 0) {
    void (async () => {
      for (let attempt = 0; attempt < 10 && !abort.signal.aborted; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (await syncConfiguredProviders()) {
          await refresh();
          break;
        }
      }
    })();
  }
  void (async () => {
    try {
      for await (const event of ctx.event.subscribe({ signal: abort.signal })) {
        if (event.type === "config.updated") {
          await ctx.provider.reload();
          await syncConfiguredProviders();
          await refresh();
        }
      }
    } catch {
    }
  })();
  return () => abort.abort();
}
__name(setupV2, "setupV2");
var v2_default = Plugin.define({
  id: "opencode.models-discovery",
  setup: setupV2
});

// src/index.ts
var combinedPlugin = {
  ...Plugin2.define({
    id: "opencode.models-discovery",
    setup: setupV2
  }),
  server: ModelDiscoveryPlugin
};
var index_default = combinedPlugin;
export {
  ModelDiscoveryPlugin,
  index_default as default,
  setupV2
};
//# sourceMappingURL=index.js.map
