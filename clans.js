var pluginName = "AClans"
var prefix = '§l§0Bandomas §a>> §0'
var prefixChat = '§l§7Bandomas §a>> §7'
var allPlugins = ll.listPlugins()
var PtitleFlag = !1
try {
    allPlugins.forEach(function (a) {
        if ("PTitle" == a) throw Error("Ptitle");
    })
} catch (a){
    "Ptitle" == a.message && ((PtitleFlag = !0),
    logger.info("Была обнаружена Ptitle -IN, а часть чата будет вынуждена обработать Ptitle"));
}

if (PtitleFlag)
    var teamPTitleAdd = ll.import("ptitleaddteamch")
    var teamPTitleDel = ll.import("ptitledelteamch")

var team_data_file = new JsonConfigFile("./plugins/AClans/data/teams.json")
var team_invite_file = new JsonConfigFile("./plugins/AClans/data/teamInvite.json")
var player_team_data_file = new JsonConfigFile("./plugins/AClans/data/playerTeams.json");
var config_data_file = new JsonConfigFile("./plugins/AClans/config.json")
var plugin_setting = config_data_file.init("plugin_setting", {
        theTeamNameLength: 4,
        isSettingPVP: !0,
        ShowNameDisplay: !0,
        chatShowTeam: !0,
    })
var lang_data_file = new JsonConfigFile("./plugins/AClans/ru-ru.json")
var lang = lang_data_file.get("translate")

ll.registerPlugin('AClan', 'Uebak', [2,2,8],{
    Author: "da",
})

mc.listen("onServerStarted", function () {
    var a = mc.newCommand("clan", lang.cmdIntroduction, PermType.Any)
    a.overload([]);
    a.setCallback(function (b, c, d, e) {
        teamMain(c.player)
    })
    a.setup()
});

function ValueCheck(a) {
    return /^[a-zA-Z0-9\u4e00-\u9fa5\u3040-\u309F\u00c0-\u00ff\u0400-\u052f\u3130-\u318F\u30A0-\u30FF]+$/.test(a) ? !0 : !1;
}
function teamMain(a) {
    var b = mc.newSimpleForm();
    b.setTitle(prefix+lang.titleMenu);
    var c = team_invite_file.init(a.realName, []).length
    var d = "" + lang.TeamInviteHint_no

    0 != c && (d = lang.TeamInviteHint_Have.replaceAll("${plInviteNum}", "" + c))
    var e = player_team_data_file.init(a.realName, [])
    0 == e.length ? (b.setContent(lang.MenuContent.replace("${pl}", "" + a.realName)),
            b.addButton(lang.buttonCreateTeam,"textures/ui/dressing_room_customization"),
            b.addButton(d, "textures/ui/dressing_room_capes"),
            b.addButton(lang.buttonQuit, "textures/ui/recap_glyph_desaturated"))
        : 1 == player_team_data_file.get(a.realName)[3]
            ? ((d = player_team_data_file.get(a.realName)),
                (d = d[1][0] + d[1][1] + d[0]),
                b.setContent(lang.headerHint.replace("${pl}", "" + a.realName).replace("${teamName}", "" + d)),
                b.addButton(lang.buttonTeamInfo, "textures/ui/message"),
                b.addButton(lang.buttonTeamManage, "textures/ui/icon_multiplayer"),
                b.addButton(lang.buttonTeamDissolve, "textures/ui/icon_trash"))
            : ((d = player_team_data_file.get(a.realName)),
                (d = d[1][0] + d[1][1] + d[0]),
                b.setContent(lang.memberHint.replace("${pl}", "" + a.realName).replace("${teamName}", "" + d)),
                b.addButton(lang.buttonTeamInfo2, "textures/ui/message"),
                b.addButton(lang.buttonQuitTeam, "textures/ui/icon_trash"));
    a.sendForm(b, function (f, g) {
        if (0 == e.length)
            switch (g) {
                case 0:
                    teamCreate(f);
                    break;
                case 1:
                    if (0 == c)
                        return f.tell(prefixChat + lang.noInviteHint), 0;
                    joinTeam(f);
            }
        else if (1 == player_team_data_file.get(f.realName)[3]) {
            var h = player_team_data_file.get(f.realName)[0];
            switch (g) {
                case 0:
                    showTeamInfo(e[0], f);
                    break;
                case 1:
                    TeamPlOperter(h, f);
                    break;
                case 2:
                    f.sendModalForm(prefix + lang.titleMenu,lang.TeamDissolvePromptAgainContent,lang.buttonTeamDissolveYes,lang.buttonTeamDissolveNo,function(k,l){
                        1 == l &&(teamRemove(player_team_data_file.get(k.realName)[0]),
                        player_team_data_file.delete(k.realName),
                        k.tell(prefixChat + lang.TeamDissolveNotic),
                        plugin_setting.ShowNameDisplay && k.rename('§7§l[§8-§7] §f'+k.realName));
                        }
                    );
            }
        } else {
            var m = player_team_data_file.get(f.realName)[0];
            switch (g) {
                case 0:
                    showTeamInfo(e[0], f);
                    break;
                case 1:
                    f.sendModalForm(prefix + lang.titleMenu,lang.TeamQuitPromptAgainContent,lang.buttonTeamQuitYes,lang.buttonTeamQuitNo,function (k, l){
                        1 == l &&
                        (leffTeam(k, m),
                        k.tell(prefixChat + m +lang.TeamQuitNotic),
                        (l = team_data_file.get(m)),
                        null != mc.getPlayer(data.name2xuid(l.teamCreate)) && (mc.getPlayer(data.name2xuid(l.teamCreate)).tell(prefixChat+k.realName+(" "+lang.TeamQuitHint)),
                        plugin_setting.ShowNameDisplay && k.rename('§7§l[§8-§7] §f'+k.realName)));
                    }
                )
            }
        }
    })
}
function leffTeam(a, b) {
    if (PtitleFlag) {
        var c = "§l" + getTeamNameColor(a) + "§r";
        (void 0 == c && null == c) || teamPTitleDel(a.realName, c);
    }
    c = team_data_file.get(b);
    for (var d = c.teamPl, e = 0; e < d.length; e++)
        if (d[e] == a.realName) {
            delete d[e];
            break;
        }
    c.teamPl = d.filter(function (f) {
        return f;
    });
    team_data_file.set(b, c);
    player_team_data_file.delete(a.realName);
    plugin_setting.ShowNameDisplay && a.rename('§7§l[§8-§7] §f'+a.realName);
}
function joinTeam(a) {
    var b = mc.newSimpleForm();
    b.setTitle(prefix + lang.titleMenu);
    b.setContent(lang.TeamJoin);
    for (var c = team_invite_file.get(a.realName), d = 0; d < c.length; d++)
        b.addButton(c[d]);
    a.sendForm(b, function (e, f) {
        if (null != f) {
            f = c[f];
            var g = team_data_file.get(f);
            if (null == g) return e.tell(prefixChat + lang.NoThisTeam), 0;
            g.teamPl.unshift(e.realName);
            var h = player_team_data_file.get(e.realName);
            h[0] = f;
            h[1] = g.teamColor;
            h[2] = g.teamID;
            h[3] = 0;
            null != mc.getPlayer(data.name2xuid(g.teamCreate)) &&
                mc.getPlayer(data.name2xuid(g.teamCreate)).tell(prefixChat + "игрок "+e.realName+" "+lang.yesJoinTeam_1)
                e.tell(prefixChat + lang.yesJoinTeam_2 + " " + f + " !");
                player_team_data_file.set(e.realName, h)
                plugin_setting.ShowNameDisplay &&
                e.rename('§7§l['+getTeamNameColor(e)+'§7] §f'+e.realName)
                PtitleFlag && ((h = "§l" + getTeamNameColor(e) + "§r"),
                (void 0 == h && null == h) || teamPTitleAdd(e.realName, h));
            team_data_file.set(f, g);
            team_invite_file.delete(e.realName);
        } else teamMain(e);
    });
}
function getTeamNameColor(a){
    a = player_team_data_file.get(a.realName);
    return a[1][0] + a[1][1] + a[0];
}
function showTeamInfo(a, b) {
    var c = team_data_file.get(a)
    var d = getTeamNameColor(b)
    a = mc.newCustomForm()
    a.setTitle(prefix + lang.titleMenu);
    a.addLabel(lang.teamInfoHint_1.replace("${teamName}", "" + d).replace("${teamCreater}", "" + c.teamCreate));
    a.addLabel(lang.TeamColor +" " +c.teamColor)
    d = c.teamPl;
    var e = c.teamPl.length + 1;
    a.addLabel(lang.TeamPlShowHint.replace("${teamAllPlNum}", "" + e));
    d.unshift("§7" + lang.hintAdd, "§a"+c.teamCreate);
    a.addStepSlider(lang.TeamPlList, d);
    c = mc.getOnlinePlayers();
    var f = 0;
    a: for (; f < c.length; f++)
        for (var g = 0; g < d.length; g++) if (c[f].realName == d[g]) continue a;
    a.addLabel(lang.TeamOnlinePl.replace("${teamAllPlNum}", "" + e));
    b.sendForm(a, function (h, m) { });
}
function TeamPlOperter(a, b) {
    var c = mc.newSimpleForm();
    c.setTitle(prefix + lang.titleMenu);
    c.setContent(lang.TeamPlOperateHint);
    c.addButton(lang.TeamPlOperateInvite);
    c.addButton(lang.TeamPlOperateRemove);
	c.addButton(lang.Opplayer);
    b.sendForm(c, function (d, e) {
        switch (e) {
            case 0:
                TeamPlInvite(a, d);
                break;
            case 1:
                if (0 == team_data_file.get(a).teamPl.length)
                return d.tell(prefixChat + lang.TeamNoPl), 0
                removePl(a, d);
			case 2:
				Opplayer(a, d);
				break;
            }
        }
    )
}
function removePl(a, b){
    var c = mc.newCustomForm();
    c.setTitle(prefix + lang.titleMenu);
    var d = team_data_file.get(a),
        e = d.teamPl.concat();
    e.unshift(lang.NoAction);
    if (null == e[1]) return b.tell(prefixChat + lang.TeamNoPl1), 0;
    c.addLabel(lang.TeamRemoveHint);
    c.addStepSlider(lang.TeamRemovePlHint, e);
    b.sendForm(c, function (f, g) {
        if (null != g || 0 != g[1]) {
            if (null != mc.getPlayer(data.name2xuid(e[g[1]]))) {
                var h = mc.getPlayer(data.name2xuid(e[g[1]]));
                if (PtitleFlag) {
                    var m = "§l" + getTeamNameColor(f) + "§r";
                    (void 0 == m && null == m) || teamPTitleDel(h.realName, m);
                }
                h.tell(prefixChat+lang.TeamKickHint.replace("${TeamName}", "" + getTeamNameColor(h)));
                player_team_data_file.delete(h.realName);
                plugin_setting.ShowNameDisplay && h.rename('§7§l[§8-§7] §f'+f.realName);
            }
            g = e[g[1]];
            for (f = 0; f < d.teamPl.length; f++)
                if (g == d.teamPl[f]) {
                    g = d.teamPl;
                    delete d.teamPl[f];
                    d.teamPl = g.filter(function (k) {
                        return k;
                    });
                    break;
                }
            team_data_file.set(a, d);
        }
    });
}
function TeamPlInvite(a, b) {
    var c = team_data_file.get(a),
    d = mc.newCustomForm();
    d.setTitle(prefix + lang.titleMenu);
    d.addLabel(lang.InvitePlToTeam.replace("${TeamName}", "" + getTeamNameColor(b)));
    var e = [];
    mc.getOnlinePlayers().forEach(function (f) {
        e.push(f.realName);
    })
    if (1 == e.length)
    return b.tell(prefixChat + lang.NoPlCanInvite), 0
    d.addDropdown("" + lang.currentCanInvite, e);
    b.sendForm(d, function (f, g) {
        if (null != g) {
            if (e[g[1]] == f.realName)
            return f.tell(prefixChat+ lang.canotInviteSelf), 0;
            player_team_data_file.init(e[g[1]], []);
            if (0 != player_team_data_file.get(e[g[1]]).length) {
                for (var h = 0; h < c.teamPl.length; h++)
                if (e[g[1]] == c.teamPl[h])
                return (
                    f.tell(prefixChat+ lang.canotInviteSelfTeamPl), 0
                    );
                    f.tell(prefixChat+ lang.InvitationExpired_1);
                    return 0;
                }
                team_invite_file.init(e[g[1]], [])
                h = team_invite_file.get(e[g[1]]);
                for (var m = 0; m < h.length; m++)
                if (a == h[m])
                return f.tell(prefixChat+ lang.InvitationExpired_2), 0;
                h.push(a);
                team_invite_file.set(e[g[1]], h);
                null != mc.getPlayer(data.name2xuid(e[g[1]])) &&
                mc.getPlayer(data.name2xuid(e[g[1]])).sendModalForm(lang.titleMenu,
                    lang.TeamWantInviteYou + a + (" " + lang.TeamWantInviteYou1),
                    lang.TeamWantInviteYou_Yes,
                    lang.TeamWantInviteYou_Neglect,
                    function (k, l) {
                        1 == l &&
                        (team_invite_file.delete(k.realName),
                        c.teamPl.push(k.realName),
                        (l = player_team_data_file.get(k.realName)),
                        (l[0] = a),
                        (l[1] = c.teamColor),
                        (l[2] = c.teamID),
                        (l[3] = 0),
                        player_team_data_file.set(k.realName, l),
                        team_data_file.set(a, c),
                        PtitleFlag && ((l = "§l" + getTeamNameColor(k) + "§r"),
                        (void 0 == l && null == l) || teamPTitleAdd(k.realName, l)),
                        k.tell(prefixChat + lang.TeamJoinSuccessHint +" " +getTeamNameColor(k)),
                        null != mc.getPlayer(data.name2xuid(c.teamCreate)) &&
                        (mc.getPlayer(data.name2xuid(c.teamCreate)).tell(prefix +k.realName +(" " + lang.TeamJoinYesHint)),
                        plugin_setting.ShowNameDisplay && k.rename('§7§l['+getTeamNameColor(k)+'§7] §f'+a.realName)
                        ))
                    })
                    f.tell(prefixChat+lang.TeamInvitePlHint.replace("${invitePl}", "" + e[g[1]])
                )
            }
        }
    )
}

function Opplayer(a, b) {
    var c = mc.newCustomForm();
    c.setTitle(prefix + lang.titleMenu);

    var d = team_data_file.get(a),
        e = d.teamPl.concat();
    e.unshift(lang.NoAction);

    if (null == e[1]) return b.tell(prefixChat + lang.TeamNoPl1), 0;

    c.addLabel(lang.OpPlTitle);
    c.addStepSlider(lang.OpPlSearch, e);

    b.sendForm(c, function (f, g) {
        if (null != g || 0 != g[1]) {
            if (null != mc.getPlayer(data.name2xuid(e[g[1]]))) {
                var h = mc.getPlayer(data.name2xuid(e[g[1]]));
                if (PtitleFlag) {
                    var m = "§l" + getTeamNameColor(f) + "§r";
                    if (void 0 == m && null == m) {
                        teamPTitleDel(h.realName, m);
                    }
                }
                h.tell(prefixChat + lang.OpMessage.replace("${TeamName}", "" + getTeamNameColor(h)));
                
                var l = player_team_data_file.get(h.realName);
                l[3] = 1;  // Здесь меняем 0 на 1
                player_team_data_file.set(h.realName, l);

                team_data_file.set(a, c);
                plugin_setting.ShowNameDisplay && h.rename('§7§l[§8-§7] §f' + f.realName);
            }
            
            g = e[g[1]];
            team_data_file.set(a, d);
        }
    });
}

function teamRemove(a) {
    var b = team_data_file.get(a),
        c = b.teamPl;
    c.push(b.teamCreate);
    for (b = 0; b < c.length; b++)
        if (null != mc.getPlayer(data.name2xuid(c[b]))) {
            var d = mc.getPlayer(data.name2xuid(c[b]));
            if (PtitleFlag) {
                var e = "§l" + getTeamNameColor(d) + "§r";
                (void 0 == e && null == e) || teamPTitleDel(d.realName, e);
            }
            d.tell(prefixChat+lang.TeamDissolveNotic_Join.replace("${teamName}","" + getTeamNameColor(d)))
            player_team_data_file.delete(d.realName);
            plugin_setting.ShowNameDisplay && d.rename('§7§l[§8-§7] §f'+d.realName);
        }
    team_data_file.delete(a);
}
function teamCreate(a) {
    var b = [
        "§1" + lang.color1,
        "§2" + lang.color2,
        "§3" + lang.color3,
        "§4" + lang.color4,
        "§5" + lang.color5,
        "§6" + lang.color6,
        "§7" + lang.color7,
        "§8" + lang.color8,
        "§9" + lang.color9,
        "§0" + lang.color0,
        "§a" + lang.colorA,
        "§b" + lang.colorB,
        "§c" + lang.colorC,
        "§d" + lang.colorD,
        "§e" + lang.colorE,
        "§f" + lang.colorF,
        "§g" + lang.colorG,
    ],
        c = mc.newCustomForm();
    c.setTitle(prefix + lang.titleMenu);
    c.addLabel(lang.TeamCreateReduceEcHint.replace("${pl}", "" + a.realName));
    c.addInput(lang.TeamNameEnterHint_1,lang.TeamNameEnterHint_2.replace("${teamNameLength}","" + plugin_setting.theTeamNameLength));
    c.addDropdown(lang.TeamColorHint, b);
    a.sendForm(c, function (d, e) {
        var f = "";
        if (null != e) {
            if ("" != e[1]) {
                if (!ValueCheck(e[1]))
                    return d.tell(prefixChat + lang.InvalidTeamName), 0;
                switch (e[2]) {
                    case 0:
                        f = b[0];
                        break;
                    case 1:
                        f = b[1];
                        break;
                    case 2:
                        f = b[2];
                        break;
                    case 3:
                        f = b[3];
                        break;
                    case 4:
                        f = b[4];
                        break;
                    case 5:
                        f = b[5];
                        break;
                    case 6:
                        f = b[6];
                        break;
                    case 7:
                        f = b[7];
                        break;
                    case 8:
                        f = b[8];
                        break;
                    case 9:
                        f = b[9];
                        break;
                    case 10:
                        f = b[10];
                        break;
                    case 11:
                        f = b[11];
                        break;
                    case 12:
                        f = b[12];
                        break;
                    case 13:
                        f = b[13];
                        break;
                    case 14:
                        f = b[14];
                        break;
                    case 15:
                        f = b[15];
                        break;
                    case 16:
                        f = b[16];
                }
                var g = data.toMD5(e[1] + "rt");
                if (e[1].length > plugin_setting.theTeamNameLength)
                    return (d.tell(prefixChat+lang.TeamCreateFail_length.replace("${teamName}", "" + e[1])),0);
                if (null != team_data_file.get(e[1]))
                    return (
                        d.tell(prefixChat+lang.TeamCreateFail_exist.replace("${teamName}", "" + e[1])),0);
                player_team_data_file.set(d.realName, [e[1], f, g, 1]);
                var h = new Date(),
                    m = h.getFullYear(),
                    k = h.getMonth() + 1;
                h = h.getDate();
                team_data_file.set(e[1], {
                    teamCreate: d.realName,
                    teamColor: f,
                    teamID: g,
                    teamPl: [],
                    teamPermission: [!1, !0],
                    teamCreateTime: lang.TeamCreateTime_Record.replace(
                        "${timeYear}",
                        "" + m
                    )
                        .replace("${timeMonth}", "" + k)
                        .replace("${timeDay}", "" + h),
                });
                m = player_team_data_file.get(d.realName);
                plugin_setting.ShowNameDisplay &&
                    d.rename('§7§l['+getTeamNameColor(d)+'§7] §f'+d.realName);
                d.tell(prefixChat+lang.TeamCreateSuccessHint.replace("${teamName}", "" + e[1]).replace("${teamColor}", "" + f));
                teamMain(d);
                return 0;
            }
            d.tell(prefixChat+ lang.TeamCreateName_null);
        } else return teamMain(d), 0;
    });
}
mc.listen("onJoin", function (a){
    player_team_data_file.init(a.realName, [])
    var b = player_team_data_file.get(a.realName)
    if (0 != b.length){
        if (null == team_data_file.get(b[0])){
            if (PtitleFlag){
                var c = "§l" + getTeamNameColor(a) + "§r";
                (void 0 == c && null == c) || teamPTitleDel(a.realName, c);
            }
            player_team_data_file.delete(a.realName)
            a.tell(prefixChat+lang.TeamDissolveNotic_Join.replace("${teamName}","" + getTeamNameColor(a)));
        } else
        plugin_setting.ShowNameDisplay && a.rename('§7§l['+getTeamNameColor(a)+'§7] §f'+a.realName);
        c = team_data_file.get(b[0]);
        for (var d = c.teamPl, e = !0, f = 0; f < d.length; f++)
        d[f] == a.realName &&
        (plugin_setting.ShowNameDisplay && a.rename('§7§l['+getTeamNameColor(a)+'§7] §f'+a.realName),
        (e = !1));
        0 == c.teamPl.length && (e = !0);
        e & (a.realName != c.teamCreate) &&
        (PtitleFlag && ((c = "§l" + getTeamNameColor(a) + "§r"),
        (void 0 == c && null == c) || teamPTitleDel(a.realName, c)),
        a.tell(prefixChat+lang.TeamKickHint.replace("${TeamName}", "" + b[0])),
        player_team_data_file.delete(a.realName));

        if(plugin_setting.ShowNameDisplay && a.realName == "ConnyKind4386"){   
            a.rename('§7§l['+getTeamNameColor(a)+'§7] §f§4ヒ§1ロ§r')
        }
        if(a.realName == "blo0ck"){   
            a.rename('§7§l[§7] §f'+a.realName)
            mc.broadcast('§7§l[§7] §f'+a.realName+'§7 > §r§f'+message(b)), !1
            return false
         }
         
//        if(a.realName == "ggtbl"){   
//            a.rename('§4'+a.realName)
//            mc.broadcast('§4'+a.realName+'§7 > §r§f'+message(b)), !1
//            return false
//         }
         if(a.realName == "RogosHD"){   
             a.rename('§7§l['+getTeamNameColor(a)+'§7] §q RogosHD')
             mc.broadcast('§7§l['+getTeamNameColor(a)+'§7]§a RogosHD'+'§7 > §r§f'+message(b)), !1
             return false
          }
         if(a.realName == "ggtbFGX"){   
             a.rename('§7§l['+getTeamNameColor(a)+'§7] §a ggtbFGX')
             mc.broadcast('§7§l['+getTeamNameColor(a)+'§7]§a ggtbFGX'+'§7 > §r§f'+message(b)), !1
             return false
          }
    }
    else if(plugin_setting.ShowNameDisplay){  
        a.rename('§7§l[§8-§7] §f'+a.realName)
    }
    else{  
        a.rename('§7§l[§8-§7] §f'+a.realName)
    }
})
function SetPlayerHP(a, b) {
    var c = a.getNbt(),
        d = c.getTag("Attributes"),
        e = d.getData(1);
    e.setFloat("Current", b);
    d.setTag(1, e);
    c.setTag("Attributes", d);
    a.setNbt(c);
}
mc.listen("onMobHurt", function (a, b, c, d) {
    if (a.isPlayer() &&((a = a.toPlayer()),
    player_team_data_file.init(a.realName, []),
    (a = player_team_data_file.get(a.realName)),
    0 != a.length && null != b && b.isPlayer())) 
    {
        b = b.toPlayer();
        player_team_data_file.init(b.realName, []);
        if (b.realName == team_data_file.get(a[0]).teamCreate)
            return b.sendText(lang.attackHint_1, 4), !0;
        c = team_data_file.get(a[0]).teamPl;
        for (d = 0; d < c.length; d++)
            if (b.realName == c[d])
                return b.sendText(lang.attackHint_2, 4), !0;
        if (
            !team_data_file.get(a[0]).teamPermission[0] &&
            0 != player_team_data_file.get(b.realName).length
        )
            return b.sendText(lang.attackHint_pvp, 4), !0;
    }
});
logger.info("Кланы Загружены");

//查看玩家队伍数据
function playerTeamData(realName) {
    player_team_data_file.init(realName, []);
    let data = player_team_data_file.get(realName);
    if (data.length == 0) {
        return null;
    } else {
        let exportData = {
            teamName: data[0],
            teamColor: data[1],
            teamID: data[2],
            teamOP: data[3],
        };
        return exportData;
    }
}

//查看队伍数据
function TeamData(team) {
    let data = team_data_file.get(team);
    if (data == null) {
        return null;
    } else {
        return data;
    }
}