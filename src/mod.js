"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const LogBackgroundColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogBackgroundColor");
const translations_json_1 = __importDefault(require("./translations.json"));
const config_json_1 = __importDefault(require("../config/config.json"));
const tiers_json_1 = __importDefault(require("../config/tiers.json"));
// Abandon hope, all ye who enter here...
let database;
let tables;
let items;
let handbook;
let logger;
let locales;
let clientItems;
let fleaPrices;
let hideoutProduction;
let hideoutAreas;
let quests;
let armors;
let therapist;
let ragman;
let jaeger;
let mechanic;
let prapor;
let peacekeeper;
let skier;
let fence;
let traderList;
// ^ PLS, somebody explain to me (I'm NOT a programmer btw) how not to use a bajillion "this.*" for EVERY variable in a class to write PROPER (sic) code. This can't be sane, I just refuse.
const euroRatio = 118; // TODO: remove hardcode
const dollarRatio = 114;
const newLine = "\n";
class ItemInfo {
    init(container) {
        database = container.resolve("DatabaseServer");
        logger.info("[Item Info] Database data is loaded, working...");
        tables = database.getTables();
        items = tables.templates.items;
        handbook = tables.templates.handbook;
        locales = tables.locales.global;
        clientItems = tables.templates.clientItems.data;
        fleaPrices = tables.templates.prices;
        hideoutProduction = tables.hideout.production;
        hideoutAreas = tables.hideout.areas;
        quests = tables.templates.quests;
        armors = tables.globals.config.ArmorMaterials;
        therapist = tables.traders["54cb57776803fa99248b456e"];
        ragman = tables.traders["5ac3b934156ae10c4430e83c"];
        jaeger = tables.traders["5c0647fdd443bc2504c2d371"];
        mechanic = tables.traders["5a7c2eca46aef81a7ca2145d"];
        prapor = tables.traders["54cb50c76803fa8b248b4571"];
        peacekeeper = tables.traders["5935c25fb3acc3127c3d8cd9"];
        skier = tables.traders["58330581ace78e27b8b10cee"];
        fence = tables.traders["579dc571d53a0658a154fbec"];
        traderList = [therapist, ragman, jaeger, mechanic, prapor, peacekeeper, skier, fence];
    }
    postDBLoad(container) {
        logger = container.resolve("WinstonLogger");
        if (config_json_1.default.delay.enabled) {
            logger.log(`[Item Info] Mod compatibility delay enabled (${config_json_1.default.delay.seconds} seconds), waiting for other mods data to load...`, LogTextColor_1.LogTextColor.BLACK, LogBackgroundColor_1.LogBackgroundColor.CYAN);
            setTimeout(() => {
                this.init(container);
                this.ItemInfoMain();
            }, config_json_1.default.delay.seconds * 1000);
        }
        else {
            this.init(container);
            this.ItemInfoMain();
        }
    }
    ItemInfoMain() {
        let userLocale = config_json_1.default.UserLocale;
        if (!config_json_1.default.HideLanguageAlert) {
            logger.log(`[Item Info] This mod supports other languages! \nМод поддерживает другие языки! \nEste mod es compatible con otros idiomas! \nTen mod obsługuje inne języki! \nEnglish, Russian, Spanish, Korean are fully translated.\nHide this message in config.json`, LogTextColor_1.LogTextColor.BLACK, LogBackgroundColor_1.LogBackgroundColor.WHITE);
            logger.log(`[Item Info] Your selected language is "${userLocale}". \nYou can now customise it in Item Info config.json file. \nLooking for translators, PM me! \nTranslation debug mode is availiable in translations.json`, LogTextColor_1.LogTextColor.BLACK, LogBackgroundColor_1.LogBackgroundColor.GREEN);
        }
        if (translations_json_1.default.debug.enabled) {
            logger.warning(`Translation debugging mode enabled! Changing userLocale to ${translations_json_1.default.debug.languageToDebug}`);
            userLocale = translations_json_1.default.debug.languageToDebug;
        }
        // Fill the missing translation dictionaries with English keys as a fallback + debug mode to help translations. Smart.
        for (const key in translations_json_1.default["en"]) {
            for (const lang in translations_json_1.default) {
                if (translations_json_1.default.debug.enabled &&
                    lang != "en" &&
                    lang == translations_json_1.default.debug.languageToDebug &&
                    translations_json_1.default[translations_json_1.default.debug.languageToDebug][key] == translations_json_1.default["en"][key] &&
                    key != "") {
                    logger.warning(translations_json_1.default.debug.languageToDebug + ` language "${translations_json_1.default[translations_json_1.default.debug.languageToDebug][key]}" is the same as in English`);
                }
                if (key in translations_json_1.default[lang] == false) {
                    if (translations_json_1.default.debug.enabled && translations_json_1.default.debug.languageToDebug == lang) {
                        logger.warning(`${lang} language is missing "${key}" transaition!`);
                    }
                    translations_json_1.default[lang][key] = translations_json_1.default["en"][key];
                }
            }
        }
        // Description generator for .md
        //const descriptionGen = false
        //if (descriptionGen) {
        //	for (const conf in config) {
        //		log("## " + conf)
        //		log("" + config[conf]._description)
        //		log("> " + config[conf]._example)
        //		log(newLine)
        //	}
        //}
        //for (const userLocale in locales){
        // Put main item loop here to make the mod universally international.
        // Insane loading times each time provided for free.
        // In theory, the whole thing can be *slightly* optimised locally, per function with dictionaries, with language arrays for each generated string, etc, but it's a MAJOR refactoring of the whole codebase, and it's not worth the hassle and my sanity.
        // Let the user select their preferred locale in config once, this will save A LOT of time for everybody, that's good enough solution.
        // I'll just pretend I thought about it beforehand and will call it "in hindsight optimization". Cheers.
        // P.S. Is there a way to access last user selected locale at IPreAkiLoadMod?
        //}
        for (const itemID in items) {
            const item = items[itemID];
            const itemInHandbook = this.getItemInHandbook(itemID);
            if (item._type === "Item" && // Check if the item is a real item and not a "node" type.
                itemInHandbook != undefined && // Ignore "useless" items
                item._props.QuestItem != true && // Ignore quest items.
                item._parent != "543be5dd4bdc2deb348b4569" // Ignore currencies.
            ) {
                let name = this.getItemName(itemID, userLocale); // for debug only
                const i18n = translations_json_1.default[userLocale];
                // boilerplate defaults
                let descriptionString = "";
                let priceString = "";
                let barterString = "";
                let productionString = "";
                let usedForBarterString = "";
                let usedForQuestsString = "";
                let usedForHideoutString = "";
                let usedForCraftingString = "";
                let armorDurabilityString = "";
                let spawnChanceString = "";
                let slotefficiencyString = "";
                let headsetDescription = "";
                let tier = "";
                let itemRarity = 0;
                let spawnString = "";
                let fleaPrice = this.getFleaPrice(itemID);
                let itemBestVendor = this.getItemBestTrader(itemID, userLocale);
                let traderPrice = Math.round(itemBestVendor.price);
                let traderName = itemBestVendor.name;
                let spawnChance = clientItems[itemID]?._props?.SpawnChance;
                let slotDensity = this.getItemSlotDensity(itemID);
                let itemBarters = this.bartersResolver(itemID);
                let barterInfo = this.barterInfoGenerator(itemBarters, userLocale);
                let barterResourceInfo = this.barterResourceInfoGenerator(itemID, userLocale);
                let rarityArray = [];
                rarityArray.push(barterInfo.rarity); // futureprofing, add other rarity calculations
                itemRarity = Math.min(...rarityArray);
                if (item._props.CanSellOnRagfair === false && itemRarity == 0) {
                    fleaPrice = i18n.BANNED;
                    itemRarity = 7;
                }
                let itemRarityFallback = "";
                if (itemRarity == 0 && clientItems[itemID]?._props?.Rarity !== undefined) {
                    itemRarityFallback = clientItems[itemID]._props.Rarity;
                }
                if (item._parent == "543be5cb4bdc2deb348b4568") {
                    // Ammo boxes special case
                    let count = item._props.StackSlots[0]._max_count;
                    let ammo = item._props.StackSlots[0]._props.filters[0].Filter[0];
                    let value = this.getItemBestTrader(ammo).price;
                    traderPrice = value * count;
                    if (itemRarity == 0) {
                        itemRarity = this.barterInfoGenerator(this.bartersResolver(ammo)).rarity;
                    }
                }
                if (config_json_1.default.BulletStatsInName.enabled == true) {
                    if (item._props.ammoType === "bullet" || item._props.ammoType === "buckshot") {
                        let damageMult = 1;
                        if (item._props.ammoType === "buckshot") {
                            damageMult = item._props.buckshotBullets;
                        }
                        this.addToName(itemID, ` (${item._props.Damage * damageMult}/${item._props.PenetrationPower})`, "append");
                    }
                }
                if (config_json_1.default.SpawnInfo.enabled) {
                    if (spawnChance > 0) {
                        spawnString += `${i18n.Spawnchance}: ${spawnChance}%` + newLine + newLine;
                    }
                }
                if (config_json_1.default.FleaAbusePatch.enabled) {
                    if (fleaPrice * 0.8 < traderPrice) {
                        // TODO: get flea min price (default 0.8) from actual config
                        // log(name)
                        let fleaPriceFix = Math.round(traderPrice * (1 / 0.8 + 0.01));
                        fleaPrices[itemID] = fleaPriceFix;
                        fleaPrice = fleaPriceFix;
                    }
                }
                if (config_json_1.default.RarityRecolor.enabled) {
                    item._props.BackgroundColor = "grey";
                    for (const customItem in config_json_1.default.RarityRecolor.customRarity) {
                        if (customItem == itemID) {
                            itemRarity = config_json_1.default.RarityRecolor.customRarity[customItem];
                        }
                    }
                    if (itemRarity == 7) {
                        tier = i18n.OVERPOWERED;
                        item._props.BackgroundColor = tiers_json_1.default.OVERPOWERED;
                    }
                    else if (itemRarity == 1) {
                        tier = i18n.COMMON;
                        item._props.BackgroundColor = tiers_json_1.default.COMMON;
                    }
                    else if (itemRarity == 2) {
                        tier = i18n.RARE;
                        item._props.BackgroundColor = tiers_json_1.default.RARE;
                    }
                    else if (itemRarity == 3) {
                        tier = i18n.EPIC;
                        item._props.BackgroundColor = tiers_json_1.default.EPIC;
                    }
                    else if (itemRarity == 4) {
                        tier = i18n.LEGENDARY;
                        item._props.BackgroundColor = tiers_json_1.default.LEGENDARY;
                    }
                    else if (itemRarity == 5) {
                        tier = i18n.UBER;
                        item._props.BackgroundColor = tiers_json_1.default.UBER;
                    }
                    else if (spawnChance < 2 || itemRarity == 6) {
                        // can get 6 from custom rules only
                        tier = i18n.UNOBTAINIUM;
                        item._props.BackgroundColor = tiers_json_1.default.UNOBTAINIUM;
                        // log(name)
                    }
                    else if (itemRarity == 8) {
                        // 8 is for custom dim red background
                        tier = i18n.CUSTOM;
                        item._props.BackgroundColor = tiers_json_1.default.CUSTOM;
                    }
                    else if (itemRarityFallback.includes("Common")) {
                        tier = i18n.COMMON;
                        item._props.BackgroundColor = tiers_json_1.default.COMMON;
                    }
                    else if (itemRarityFallback.includes("Rare")) {
                        tier = i18n.RARE;
                        item._props.BackgroundColor = tiers_json_1.default.RARE;
                    }
                    else if (itemRarityFallback.includes("Superrare")) {
                        tier = i18n.EPIC;
                        item._props.BackgroundColor = tiers_json_1.default.EPIC;
                    }
                    else if (itemRarityFallback == "Not_exist") {
                        tier = i18n.LEGENDARY;
                        item._props.BackgroundColor = tiers_json_1.default.LEGENDARY;
                        // log(name)
                    }
                    else {
                        // everything else that falls in here
                        tier = i18n.UNKNOWN;
                        item._props.BackgroundColor = tiers_json_1.default.UNKNOWN;
                    }
                    if (config_json_1.default.RarityRecolor.addTierNameToPricesInfo) {
                        if (tier.length > 0) {
                            priceString += tier + " | ";
                        }
                    }
                }
                if (config_json_1.default.ArmorInfo.enabled) {
                    if (item._props.armorClass > 0) {
                        let armor = armors[item._props.ArmorMaterial];
                        // prettier-ignore
                        armorDurabilityString += `${config_json_1.default.ArmorInfo.addArmorClassInfo ? i18n.Armorclass + ": " + item._props.armorClass + " | " : ""}${i18n.Effectivedurability}: ${Math.round(item._props.MaxDurability / armor.Destructibility)} (${i18n.Max}: ${item._props.MaxDurability} x ${locales[userLocale][`Mat${(item._props.ArmorMaterial)}`]}: ${roundWithPrecision(1 / armor.Destructibility, 1)}) | ${i18n.Repairdegradation}: ${Math.round(armor.MinRepairDegradation * 100)}% - ${Math.round(armor.MaxRepairDegradation * 100)}%` + newLine + newLine;
                        //log(name)
                        //log(armorDurabilityString)
                    }
                }
                if (config_json_1.default.ContainerInfo.enabled) {
                    if (item._props.Grids?.length > 0) {
                        let totalSlots = 0;
                        for (const grid of item._props.Grids) {
                            totalSlots += grid._props.cellsH * grid._props.cellsV;
                        }
                        let slotefficiency = roundWithPrecision(totalSlots / (item._props.Width * item._props.Height), 2);
                        // prettier-ignore
                        slotefficiencyString += `${i18n.Slotefficiency}: ×${slotefficiency} (${totalSlots}/${item._props.Width * item._props.Height})` + newLine + newLine;
                        // log(name)
                        // log(slotefficiencyString)
                    }
                }
                if (config_json_1.default.MarkValueableItems.enabled) {
                    let itemvalue = traderPrice / slotDensity;
                    let fleaValue;
                    if (item._props.CanSellOnRagfair === false && config_json_1.default.MarkValueableItems.alwaysMarkBannedItems) {
                        fleaValue = config_json_1.default.MarkValueableItems.fleaSlotValueThresholdBest + 1; // always mark flea banned items as best.
                    }
                    else {
                        fleaValue = fleaPrice / slotDensity;
                    }
                    if (items[itemID]._parent != "5795f317245977243854e041") {
                        // ignore containers
                        if (itemvalue > config_json_1.default.MarkValueableItems.traderSlotValueThresholdBest || fleaValue > config_json_1.default.MarkValueableItems.fleaSlotValueThresholdBest) {
                            if (config_json_1.default.MarkValueableItems.addToShortName) {
                                this.addToShortName(itemID, "★", "prepend");
                            }
                            if (config_json_1.default.MarkValueableItems.addToName) {
                                this.addToName(itemID, "★", "append");
                            }
                        }
                        else if (itemvalue > config_json_1.default.MarkValueableItems.traderSlotValueThresholdGood || fleaValue > config_json_1.default.MarkValueableItems.fleaSlotValueThresholdGood) {
                            if (config_json_1.default.MarkValueableItems.addToShortName) {
                                this.addToShortName(itemID, "☆", "prepend");
                            }
                            if (config_json_1.default.MarkValueableItems.addToName) {
                                this.addToName(itemID, "☆", "append");
                            }
                        }
                    }
                }
                if (config_json_1.default.PricesInfo.enabled) {
                    // prettier-ignore
                    priceString += (config_json_1.default.PricesInfo.addFleaPrice ? i18n.Fleaprice + ": " + fleaPrice + (fleaPrice > 0 ? "₽" : "") + " | " : "") + i18n.Valuation1 + traderName + i18n.Valuation2 + ": " + traderPrice + "₽" + newLine + newLine;
                    // log(priceString)
                }
                if (config_json_1.default.HeadsetInfo.enabled) {
                    if (item._props.Distortion !== undefined) {
                        let gain = item._props.CompressorGain;
                        let thresh = item._props.CompressorTreshold;
                        // prettier-ignore
                        headsetDescription = `${i18n.AmbientVolume}: ${item._props.AmbientVolume}dB | ${i18n.Compressor}: ${i18n.Gain} +${gain}dB × ${i18n.Treshold} ${thresh}dB ≈ ×${Math.abs((gain * thresh) / 100)} ${i18n.Boost} | ${i18n.ResonanceFilter}: ${item._props.Resonance}@${item._props.CutoffFreq}Hz | ${i18n.Distortion}: ${Math.round(item._props.Distortion * 100)}%` + newLine + newLine;
                        // log(name)
                        // log(headsetDescription)
                    }
                }
                if (config_json_1.default.BarterInfo.enabled) {
                    if (barterInfo.barters.length > 1) {
                        barterString = barterInfo.barters + newLine;
                        // log(name)
                        // log(barterString)
                    }
                }
                if (config_json_1.default.ProductionInfo.enabled) {
                    let productionInfo = this.productionGenarator(itemID, userLocale);
                    if (productionInfo.length > 1) {
                        productionString = productionInfo + newLine;
                        // log(name)
                        // log(productionString)
                    }
                }
                if (config_json_1.default.BarterResourceInfo.enabled) {
                    if (barterResourceInfo.length > 1) {
                        usedForBarterString = barterResourceInfo + newLine;
                        // log(name)
                        // log(usedForBarterString)
                    }
                }
                if (config_json_1.default.QuestInfo.enabled) {
                    const itemQuestInfo = this.QuestInfoGenerator(itemID, userLocale);
                    if (itemQuestInfo.length > 1) {
                        usedForQuestsString = itemQuestInfo + newLine;
                        // item._props.BackgroundColor = "tracerGreen"
                        if (config_json_1.default.QuestInfo.FIRinName && itemQuestInfo.includes("✔")) {
                            this.addToName(itemID, "✔", "append");
                            this.addToShortName(itemID, "", "prepend"); // ✔ is not shown in inventory icon font :(
                        }
                        // log(this.getItemName(itemID))
                        // log(usedForQuestsString)
                    }
                }
                if (config_json_1.default.HideoutInfo.enabled) {
                    const itemHideoutInfo = this.HideoutInfoGenerator(itemID, userLocale);
                    if (itemHideoutInfo.length > 1) {
                        usedForHideoutString = itemHideoutInfo + newLine;
                        // log(name)
                        // log(usedForHideoutString)
                    }
                }
                if (config_json_1.default.CraftingMaterialInfo.enabled) {
                    const itemCraftingMaterialInfo = this.CraftingMaterialInfoGenarator(itemID, userLocale);
                    if (itemCraftingMaterialInfo.length > 1) {
                        usedForCraftingString = itemCraftingMaterialInfo + newLine;
                        // log(name)
                        // log(usedForCraftingString)
                    }
                }
                descriptionString =
                    priceString +
                        spawnString +
                        spawnChanceString +
                        headsetDescription +
                        armorDurabilityString +
                        slotefficiencyString +
                        usedForQuestsString +
                        usedForHideoutString +
                        barterString +
                        productionString +
                        usedForCraftingString +
                        usedForBarterString;
                this.addToDescription(itemID, descriptionString, "prepend");
                const debug = false;
                if (debug) {
                    log(this.getItemName(itemID, userLocale));
                    log(descriptionString);
                    // log(this.getItemDescription(itemID, userLocale))
                    log(`---`);
                }
                // this.addToName(itemID, "✅✓✔☑🗸⍻√❎❌✖✗✘☒", "append");
            }
        }
        logger.success("[Item Info] Finished processing items, enjoy!");
        if (translations_json_1.default.debug.enabled) {
            let debugItemIDlist = ["590a3efd86f77437d351a25b", "5c0e722886f7740458316a57", "5645bcc04bdc2d363b8b4572", "590c621186f774138d11ea29"];
            for (const debugItemID of debugItemIDlist) {
                logger.info(`---`);
                logger.info(newLine);
                logger.info(debugItemID);
                logger.info(this.getItemName(debugItemID, translations_json_1.default.debug.languageToDebug));
                logger.info(newLine);
                logger.info(this.getItemDescription(debugItemID, translations_json_1.default.debug.languageToDebug));
            }
        }
    }
    getItemName(itemID, locale = "en") {
        if (locales[locale][`${itemID} Name`] != undefined) {
            return locales[locale][`${itemID} Name`];
        }
        else {
            return locales["en"][`${itemID} Name`];
        }
    }
    getItemShortName(itemID, locale = "en") {
        if (locales[locale][`${itemID} ShortName`] != undefined) {
            return locales[locale][`${itemID} ShortName`];
        }
        else {
            return locales["en"][`${itemID} ShortName`];
        }
    }
    getItemDescription(itemID, locale = "en") {
        if (locales[locale][`${itemID} Description`] != undefined) {
            return locales[locale][`${itemID} Description`];
        }
        else {
            return locales["en"][`${itemID} Description`];
        }
    }
    addToName(itemID, addToName, place, lang = "") {
        if (lang == "") {
            // I'm actually really proud of this one! If no lang argument is passed, it defaults to recursion for all languages.
            for (const locale in locales) {
                this.addToName(itemID, addToName, place, locale);
            }
        }
        else {
            let originalName = this.getItemName(itemID, lang);
            switch (place) {
                case "prepend":
                    locales[lang][`${itemID} Name`] = addToName + originalName;
                    break;
                case "append":
                    locales[lang][`${itemID} Name`] = originalName + addToName;
                    break;
            }
        }
    }
    addToShortName(itemID, addToShortName, place, lang = "") {
        if (lang == "") {
            for (const locale in locales) {
                this.addToShortName(itemID, addToShortName, place, locale);
            }
        }
        else {
            let originalShortName = this.getItemShortName(itemID, lang);
            switch (place) {
                case "prepend":
                    locales[lang][`${itemID} ShortName`] = addToShortName + originalShortName;
                    break;
                case "append":
                    locales[lang][`${itemID} ShortName`] = originalShortName + addToShortName;
                    break;
            }
        }
    }
    addToDescription(itemID, addToDescription, place, lang = "") {
        if (lang == "") {
            for (const locale in locales) {
                this.addToDescription(itemID, addToDescription, place, locale);
            }
        }
        else {
            let originalDescription = this.getItemDescription(itemID, lang);
            switch (place) {
                case "prepend":
                    locales[lang][`${itemID} Description`] = addToDescription + originalDescription;
                    break;
                case "append":
                    locales[lang][`${itemID} Description`] = originalDescription + addToDescription;
                    break;
            }
        }
    }
    getItemSlotDensity(itemID) {
        return (items[itemID]._props.Width * items[itemID]._props.Height) / items[itemID]._props.StackMaxSize;
    }
    getItemInHandbook(itemID) {
        return handbook.Items.filter((i) => i.Id === itemID)[0]; // Outs: @Id, @ParentId, @Price
    }
    resolveBestTrader(handbookParentId, locale = "en") {
        // I stole this code from someone looong ago, can't remember where, PM me to give proper credit
        let traderSellCategory = "";
        let traderMulti = 0.54; // AVG fallback
        let altTraderSellCategory = "";
        let traderName = "";
        let handbookCategories = handbook.Categories.filter((i) => i.Id === handbookParentId)[0];
        traderSellCategory = handbookCategories?.Id; // "?" check is for shitty custom items
        altTraderSellCategory = handbookCategories?.ParentId;
        for (let i = 0; i < 8; i++) {
            if (traderList[i].base.sell_category.includes(traderSellCategory) || traderList[i].base.sell_category.includes(altTraderSellCategory)) {
                traderMulti = (100 - traderList[i].base.loyaltyLevels[0].buy_price_coef) / 100;
                //traderName = traderList[i].base.nickname
                traderName = locales[locale][`${traderList[i].base._id} Nickname`];
                return {
                    multi: traderMulti,
                    name: traderName,
                };
            }
        }
        return traderMulti;
    }
    getItemBestTrader(itemID, locale = "en") {
        let itemBasePrice = 1;
        let handbookItem = this.getItemInHandbook(itemID);
        // log(handbookItem)
        let bestTrader = this.resolveBestTrader(handbookItem.ParentId, locale);
        let result = handbookItem.Price * bestTrader.multi;
        return {
            price: result,
            name: bestTrader.name,
            ParentId: handbookItem.ParentId,
        };
    }
    getFleaPrice(itemID) {
        if (typeof fleaPrices[itemID] != "undefined") {
            return fleaPrices[itemID];
        }
        else {
            return this.getItemBestTrader(itemID).price;
        }
    }
    bartersResolver(itemID) {
        let itemBarters = [];
        for (let trader = 0; trader < 7; trader++ // iterate excluding Fence sales.
        ) {
            for (const barter of traderList[trader].assort.items) {
                if (barter._tpl == itemID && barter.parentId === "hideout") {
                    const barterResources = traderList[trader].assort.barter_scheme[barter._id][0];
                    const barterLoyaltyLevel = traderList[trader].assort.loyal_level_items[barter._id];
                    const traderID = traderList[trader].base._id;
                    itemBarters.push({ traderID, barterLoyaltyLevel, barterResources });
                } /* else if (barter._tpl == itemID && barter.parentId != "hideout") {
                    let rec = (b) => {
                        let x = traderList[trader].assort.items.filter((x) => x._id == b)

                        if (x.length > 0) {
                            if (x[0].parentId != "hideout") {
                                rec(x[0].parentId)
                            } else {
                                this.bartersResolver(x[0]._tpl) // I need help resolving this recursion for unbuyable items in weapon presets, it seems to work, but not really. feel dumb
                            }
                        }
                    }
                    // log(barter)
                    rec(barter.parentId)
                }*/
            }
        }
        return itemBarters;
    }
    barterInfoGenerator(itemBarters, locale = "en") {
        let barterString = "";
        let rarityArray = [];
        let prices = [];
        for (const barter of itemBarters) {
            let totalBarterPrice = 0;
            let totalBarterPriceString = "";
            let traderName = locales[locale][`${barter.traderID} Nickname`];
            barterString += `${translations_json_1.default[locale].Bought} ${translations_json_1.default[locale].at} ${traderName} ${translations_json_1.default[locale].lv}${barter.barterLoyaltyLevel} < `;
            let isBarter = false;
            for (let resource of barter.barterResources) {
                if (resource._tpl == "5449016a4bdc2d6f028b456f") {
                    let rubles = resource.count;
                    barterString += `${Math.round(rubles)}₽ + `;
                }
                else if (resource._tpl == "569668774bdc2da2298b4568") {
                    let euro = resource.count;
                    barterString += `${Math.round(euro)}€ ≈ ${Math.round(euroRatio * euro)}₽ + `;
                }
                else if (resource._tpl == "5696686a4bdc2da3298b456a") {
                    let dollars = resource.count;
                    barterString += `$${Math.round(dollars)} ≈ ${Math.round(dollarRatio * dollars)}₽ + `;
                }
                else {
                    totalBarterPrice += this.getFleaPrice(resource._tpl) * resource.count;
                    barterString += this.getItemShortName(resource._tpl, locale);
                    barterString += ` ×${resource.count} + `;
                    isBarter = true;
                }
            }
            if (isBarter) {
                rarityArray.push(barter.barterLoyaltyLevel + 1);
            }
            else {
                rarityArray.push(barter.barterLoyaltyLevel);
            }
            if (totalBarterPrice != 0) {
                totalBarterPriceString = ` | Σ ≈ ${Math.round(totalBarterPrice)}₽`;
            }
            barterString = barterString.slice(0, barterString.length - 3) + totalBarterPriceString + "\n";
        }
        return {
            prices: prices,
            barters: barterString,
            rarity: rarityArray.length == 0 ? 0 : Math.min(...rarityArray),
        };
    }
    barterResourceInfoGenerator(itemID, locale = "en") {
        // Refactor this abomination pls
        let baseBarterString = "";
        for (let trader = 0; trader < 7; trader++ // iterate excluding Fence sales.
        ) {
            let traderName = locales[locale][`${traderList[trader].base._id} Nickname`];
            for (let barterID in traderList[trader].assort.barter_scheme) {
                // iterate all seller barters
                for (let srcs in traderList[trader].assort.barter_scheme[barterID][0]) {
                    if (traderList[trader].assort.barter_scheme[barterID][0][srcs]._tpl == itemID) {
                        let barterResources = traderList[trader].assort.barter_scheme[barterID][0];
                        let bartedForItem;
                        let totalBarterPrice = 0;
                        let barterLoyaltyLevel = traderList[trader].assort.loyal_level_items[barterID];
                        for (let originalBarter in traderList[trader].assort.items) {
                            if (traderList[trader].assort.items[originalBarter]._id == barterID) {
                                bartedForItem = traderList[trader].assort.items[originalBarter]._tpl;
                            }
                        }
                        baseBarterString += translations_json_1.default[locale].Traded + " ×" + traderList[trader].assort.barter_scheme[barterID][0][srcs].count + " ";
                        baseBarterString +=
                            translations_json_1.default[locale].at + " " + traderName + " " + translations_json_1.default[locale].lv + barterLoyaltyLevel + " > " + this.getItemName(bartedForItem, locale);
                        let extendedBarterString = " < … + ";
                        for (let barterResource in barterResources) {
                            totalBarterPrice += this.getFleaPrice(barterResources[barterResource]._tpl) * barterResources[barterResource].count;
                            if (barterResources[barterResource]._tpl != itemID) {
                                extendedBarterString += this.getItemShortName(barterResources[barterResource]._tpl, locale);
                                extendedBarterString += ` ×${barterResources[barterResource].count} + `;
                            }
                        }
                        if (totalBarterPrice != 0) {
                            totalBarterPrice = ` | Δ ≈ ${Math.round(this.getFleaPrice(bartedForItem) - totalBarterPrice)}₽`;
                        }
                        else {
                            totalBarterPrice = "";
                        }
                        extendedBarterString = extendedBarterString.slice(0, extendedBarterString.length - 3);
                        extendedBarterString += totalBarterPrice;
                        baseBarterString += extendedBarterString + "\n";
                    }
                }
            }
        }
        return baseBarterString;
    }
    getCraftingAreaName(areaType, locale = "en") {
        let stringName = `hideout_area_${areaType}_name`;
        return locales[locale][stringName];
    }
    getCraftingRarity(areaType, Level) {
        for (let s in hideoutAreas[areaType].stages) {
            if (s > 1) {
                return Level + 1;
            }
            else {
                return 4;
            }
        }
    }
    productionGenarator(itemID, locale = "en") {
        let craftableString = "";
        let rarityArray = [];
        for (let recipeId in hideoutProduction) {
            if (itemID === hideoutProduction[recipeId].endProduct && hideoutProduction[recipeId].areaType != "21") {
                // Find every recipe for itemid and don't use Christmas Tree crafts
                let recipe = hideoutProduction[recipeId];
                let componentsString = "";
                let recipeAreaString = this.getCraftingAreaName(recipe.areaType, locale);
                let totalRecipePrice = 0;
                let recipeDivision = "";
                for (let i = recipe.requirements.length - 1; i >= 0; i-- // Itterate
                ) {
                    if (recipe.requirements[i].type === "Area") {
                        let recipeArea = recipe.requirements[i]; // Find and save craft area object
                        recipeAreaString = this.getCraftingAreaName(recipeArea.areaType, locale) + " " + translations_json_1.default[locale].lv + recipeArea.requiredLevel;
                        rarityArray.push(this.getCraftingRarity(recipeArea.areaType, recipeArea.requiredLevel));
                    }
                    if (recipe.requirements[i].type === "Item") {
                        let craftComponentId = recipe.requirements[i].templateId;
                        let craftComponentCount = recipe.requirements[i].count;
                        let craftComponentPrice = this.getFleaPrice(craftComponentId);
                        componentsString += this.getItemShortName(craftComponentId, locale) + " ×" + craftComponentCount + " + ";
                        totalRecipePrice += craftComponentPrice * craftComponentCount;
                    }
                    if (recipe.requirements[i].type === "Resource") {
                        // superwater calculation
                        let craftComponentId = recipe.requirements[i].templateId;
                        let resourceProportion = recipe.requirements[i].resource / items[recipe.requirements[i].templateId]._props.Resource;
                        let craftComponentPrice = this.getFleaPrice(craftComponentId);
                        componentsString += this.getItemShortName(craftComponentId, locale) + " ×" + Math.round(resourceProportion * 100) + "%" + " + ";
                        totalRecipePrice += Math.round(craftComponentPrice * resourceProportion);
                    } // add case for Bitcoin farm calculation.
                }
                if (recipe.count > 1) {
                    recipeDivision = " " + translations_json_1.default[locale].peritem;
                }
                componentsString = componentsString.slice(0, componentsString.length - 3);
                craftableString += `${translations_json_1.default[locale].Crafted} ×${recipe.count} @ ${recipeAreaString} < `;
                craftableString += `${componentsString} | Σ${recipeDivision} ≈ ${Math.round(totalRecipePrice / recipe.count)}₽\n`;
                // if (fleaPrice > totalRecipePrice/recipe.count) {
                // 	let profit = Math.round(fleaPrice-(totalRecipePrice/recipe.count))
                // 	console.log("Hava Nagila! Profitable craft at " + profit + " profit detected! " + this.GetItemName(id) + " can be crafted at " + recipeAreaString)
                // }
            }
        }
        return craftableString;
    }
    HideoutInfoGenerator(itemID, locale = "en") {
        // make it like this
        // const r = data.filter(d => d.courses.every(c => courses.includes(c.id)));
        let hideoutString = "";
        for (let area in hideoutAreas) {
            for (let s in hideoutAreas[area].stages) {
                for (let a in hideoutAreas[area].stages[s].requirements) {
                    if (hideoutAreas[area].stages[s].requirements[a].templateId == itemID) {
                        hideoutString += `${translations_json_1.default[locale].Need} ×${hideoutAreas[area].stages[s].requirements[a].count} > ${this.getCraftingAreaName(hideoutAreas[area].type, locale)} ${translations_json_1.default[locale].lv}${s}\n`;
                    }
                }
            }
        }
        // console.log(hideoutString)
        return hideoutString;
    }
    CraftingMaterialInfoGenarator(itemID, locale = "en") {
        let usedForCraftingString = "";
        let totalCraftingPrice = 0;
        for (let craftID in hideoutProduction) {
            for (let s in hideoutProduction[craftID].requirements) {
                if (hideoutProduction[craftID].requirements[s].templateId == itemID) {
                    let usedForCraftingComponentsString = " < … + ";
                    let recipeAreaString = "";
                    let totalRecipePrice = 0;
                    for (let i = hideoutProduction[craftID].requirements.length - 1; i >= 0; i-- // Itterate
                    ) {
                        if (hideoutProduction[craftID].requirements[i].type == "Area") {
                            // prettier-ignore
                            recipeAreaString = this.getCraftingAreaName(hideoutProduction[craftID].requirements[i].areaType, locale) + " " + translations_json_1.default[locale].lv + hideoutProduction[craftID].requirements[i].requiredLevel;
                        }
                        if (hideoutProduction[craftID].requirements[i].type == "Item") {
                            let craftComponent = hideoutProduction[craftID].requirements[i];
                            if (craftComponent.templateId != itemID) {
                                usedForCraftingComponentsString += this.getItemShortName(craftComponent.templateId, locale) + " ×" + craftComponent.count + " + ";
                            }
                            totalRecipePrice += this.getFleaPrice(craftComponent.templateId) * craftComponent.count;
                        }
                        if (hideoutProduction[craftID].requirements[i].type == "Resource") {
                            let craftComponent = hideoutProduction[craftID].requirements[i];
                            let resourceProportion = craftComponent.resource / items[craftComponent.templateId]._props.Resource;
                            if (craftComponent.templateId != itemID) {
                                usedForCraftingComponentsString +=
                                    this.getItemShortName(craftComponent.templateId, locale) + " ×" + Math.round(resourceProportion * 100) + "%" + " + ";
                            }
                            totalRecipePrice += Math.round(this.getFleaPrice(craftComponent.templateId) * resourceProportion);
                        }
                    }
                    usedForCraftingComponentsString = usedForCraftingComponentsString.slice(0, usedForCraftingComponentsString.length - 3);
                    // prettier-ignore
                    usedForCraftingComponentsString += ` | Δ ≈ ${Math.round(this.getFleaPrice(hideoutProduction[craftID].endProduct) * hideoutProduction[craftID].count - totalRecipePrice)}₽`;
                    // prettier-ignore
                    usedForCraftingString += `${hideoutProduction[craftID].requirements[s].type == "Tool" ? translations_json_1.default[locale].Tool : translations_json_1.default[locale].Part + " ×" + hideoutProduction[craftID].requirements[s].count} > ${this.getItemName(hideoutProduction[craftID].endProduct, locale)} ×${hideoutProduction[craftID].count}`;
                    usedForCraftingString += ` @ ${recipeAreaString + usedForCraftingComponentsString}\n`;
                }
            }
        }
        // console.log(hideoutString)
        // log (usedForCraftingString)
        return usedForCraftingString;
    }
    QuestInfoGenerator(itemID, locale = "en") {
        let questString = "";
        for (let questID in quests) {
            let questName = locales[locale][`${questID} name`];
            let questConditions = quests[questID].conditions.AvailableForFinish;
            for (let i in questConditions) {
                if (questConditions[i]._parent == "HandoverItem" && questConditions[i]._props.target[0] == itemID) {
                    let trader = quests[questID].traderId;
                    //let tradeName = tables.traders[trader].base.nickname
                    let traderName = locales[locale][`${trader} Nickname`];
                    // prettier-ignore
                    questString += `${translations_json_1.default[locale].Found} ${questConditions[i]._props.onlyFoundInRaid ? "(✔) " : ""}×${questConditions[i]._props.value} > ${questName} @ ${traderName}\n`;
                }
            }
        }
        return questString;
    }
}
function roundWithPrecision(num, precision) {
    var multiplier = Math.pow(10, precision);
    return Math.round(num * multiplier) / multiplier;
}
const log = (i) => {
    // for my sanity and convenience
    console.log(i);
};
module.exports = { mod: new ItemInfo() };
