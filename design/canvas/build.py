import re, pathlib, json

P = pathlib.Path(__file__).parent / "project"

MARK = ('<svg width="{s}" height="{s}" viewBox="0 0 200 200" aria-hidden="true">'
        '<rect x="40" y="42" width="44" height="130" rx="22" fill="{fg}"></rect>'
        '<circle cx="118" cy="92" r="50" fill="none" stroke="{fg}" stroke-width="44"></circle>'
        '<circle cx="118" cy="92" r="28" fill="{hole}"></circle>'
        '<path d="M104 93l10 10 20-22" fill="none" stroke="{tick}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></path></svg>')
AURA = ('radial-gradient(70% 70% at 25% 20%, #FF6A3D 0%, rgba(255,106,61,0) 70%), '
        'radial-gradient(60% 60% at 85% 30%, #FFB020 0%, rgba(255,176,32,0) 70%), #0C0C0D')

def tile(size, radius, svg, href="Home.dc.html", tag="a"):
    extra = f' href="{href}" aria-label="partile"' if tag == "a" else ""
    return (f'<{tag}{extra} style="width: {size}px; height: {size}px; border-radius: {radius}px; background: {AURA}; '
            f'display: flex; align-items: center; justify-content: center; text-decoration: none; flex-shrink: 0">{svg}</{tag}>')

LOGO_RAIL = tile(36, 11, MARK.format(s=28, fg="#FFFFFF", hole="#0C0C0D", tick="#FFFFFF"))
LOGO_MOBILE = tile(30, 9, MARK.format(s=24, fg="#FFFFFF", hole="#0C0C0D", tick="#FFFFFF"), tag="span")
LOGO_BIG = tile(56, 16, MARK.format(s=44, fg="#FFFFFF", hole="#0C0C0D", tick="#FFFFFF"), tag="span")
LOGO_TILE = tile(36, 11, MARK.format(s=28, fg="#FFFFFF", hole="#0C0C0D", tick="#FFFFFF"), tag="span")  # for use inside an <a>

OLD_RAIL = re.compile(r'<a href="Home\.dc\.html" aria-label="partile" style="width: 36px;[^>]*>p</a>')
OLD_MOBILE = re.compile(r'<span style="width: 30px; height: 30px; border-radius: 10px; background: linear-gradient\(135deg, #FF6A3D, #FFB020\);[^>]*>p</span>')
OLD_BIG = re.compile(r'<span style="width: 56px; height: 56px; border-radius: 18px; background: linear-gradient\(135deg, #FF6A3D, #FFB020\);[^>]*>p</span>')

ICONS = {
 "home": '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"></path>',
 "explore": '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>',
 "create": '<rect x="3" y="3" width="18" height="18" rx="5"></rect><path d="M12 8v8M8 12h8"></path>',
 "card": '<rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="M3 8l9 6 9-6"></path>',
 "messages": '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-4.6A8 8 0 1 1 21 12z"></path>',
 "bell": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"></path>',
 "gear": '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>',
}
LINKS = [("home","Home.dc.html","Ana sayfa"),("explore","Explore.dc.html","Keşfet"),("create","Create.dc.html","Plan oluştur"),
         ("card","Card.dc.html","Kart gönder"),("messages","Empty.dc.html","Mesajlar"),("bell","Notifications.dc.html","Bildirimler")]

def rail(active, height, avatar="OB"):
    items = []
    for key, href, label in LINKS:
        on = key == active
        bg = "background: rgba(255,255,255,0.12); " if on else ""
        col = "#FFFFFF" if on else "#A8A39B"
        items.append(f'<a href="{href}" aria-label="{label}" style="width: 44px; height: 44px; border-radius: 12px; {bg}display: flex; align-items: center; justify-content: center; color: {col}">'
                     f'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[key]}</svg></a>')
    gear = f'<a href="Settings.dc.html" aria-label="Ayarlar" style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #A8A39B"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS["gear"]}</svg></a>'
    av = f'<a href="Profile.dc.html" aria-label="Profil" style="width: 36px; height: 36px; border-radius: 999px; background: linear-gradient(135deg, #1EC9B0, #FFB020); display: flex; align-items: center; justify-content: center; color: #0C0C0D; font-weight: 800; font-size: 13px; text-decoration: none">{avatar}</a>'
    return (f'<nav aria-label="Ana menü" style="position: absolute; left: 0; top: 0; width: 72px; height: {height}px; background: rgba(12,12,13,0.55); border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; align-items: center; padding: 20px 0 16px; box-sizing: border-box; color: #F5F2EC">'
            f'{LOGO_RAIL}<div style="margin-top: 88px; display: flex; flex-direction: column; gap: 22px; align-items: center">{"".join(items)}</div>'
            f'<div style="margin-top: auto; display: flex; flex-direction: column; gap: 18px; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); width: 48px">{av}</div></nav>')

TOPRIGHT = ('<div style="position: absolute; right: 40px; top: 18px; display: flex; align-items: center; gap: 10px">'
            '<a href="#" style="height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.06); color: #F5F2EC; font-weight: 600; font-size: 15px; display: flex; align-items: center; text-decoration: none">Uygulamayı indir</a>'
            '<a href="Create.dc.html" style="height: 44px; padding: 0 20px; border-radius: 999px; background: #FFFFFF; color: #0C0C0D; font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; text-decoration: none"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>Oluştur</a>'
            '<button type="button" aria-label="Menü" style="width: 44px; height: 44px; border: 0; background: transparent; color: #F5F2EC; display: flex; align-items: center; justify-content: center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button></div>')

def tabbar(active):
    items = [("home","HomeMobile.dc.html","Ana sayfa","home"),("explore","Explore.dc.html","Keşfet","explore"),("create","CreateMobile.dc.html","Oluştur","create"),("bell","Notifications.dc.html","Bildirimler","bell"),("profile","Profile.dc.html","Profil",None)]
    out = []
    for key, href, label, icon in items:
        on = key == active
        col = "#FFFFFF" if on else "#A8A39B"
        if key == "create":
            inner = ('<span style="width: 48px; height: 48px; border-radius: 999px; background: #FFFFFF; color: #0C0C0D; display: flex; align-items: center; justify-content: center">'
                     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></span>')
        elif icon:
            inner = f'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[icon]}</svg>'
        else:
            inner = f'<span style="width: 28px; height: 28px; border-radius: 999px; background: linear-gradient(135deg, #1EC9B0, #FFB020); color: #0C0C0D; font-weight: 800; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid {col}">OB</span>'
        out.append(f'<a href="{href}" aria-label="{label}" style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; color: {col}; text-decoration: none">{inner}</a>')
    return ('<nav aria-label="Alt menü" style="position: absolute; left: 0; right: 0; bottom: 0; height: 84px; box-sizing: border-box; padding: 6px 12px 22px; background: rgba(12,12,13,0.88); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-around; align-items: center">'
            + "".join(out) + '</nav>')

OCCASIONS = [("dogum-gunu", "Doğum günü", "Occasion.dc.html"), ("yemek", "Yemek & brunch", "#"), ("ev-partisi", "Ev partisi", "#"), ("yilbasi", "Yılbaşı", "#"), ("kina", "Kına & nişan", "#")]

def pubnav(active=None, tone="dark"):
    fg = "#F5F2EC" if tone == "dark" else "#0C0C0D"
    dim = "#CFC9C0" if tone == "dark" else "#5F584F"
    links = "".join(f'<a href="{href}" style="color: {fg if key == active else dim}; font-weight: {700 if key == active else 600}; font-size: 15px; text-decoration: none; padding: 8px 2px">{label}</a>' for key, label, href in OCCASIONS)
    login = f'<a href="Login.dc.html" style="height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid {"rgba(255,255,255,0.3)" if tone == "dark" else "rgba(0,0,0,0.25)"}; color: {fg}; font-weight: 700; font-size: 15px; display: flex; align-items: center; text-decoration: none">Giriş</a>'
    create = ('<a href="Create.dc.html" style="height: 44px; padding: 0 20px; border-radius: 999px; background: #FFFFFF; color: #0C0C0D; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 8px; text-decoration: none; border: 1px solid rgba(0,0,0,0.08)">'
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>Oluştur</a>')
    return (f'<header style="position: absolute; left: 0; right: 0; top: 0; height: 76px; display: flex; align-items: center; padding: 0 48px; gap: 36px; color: {fg}">'
            f'<a href="Landing.dc.html" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: {fg}">{LOGO_TILE}<span style="font: 800 26px \'Schibsted Grotesk\', sans-serif; letter-spacing: -0.8px">partile</span></a>'
            f'<nav aria-label="Ana menü" style="display: flex; gap: 24px; align-items: center">{links}</nav>'
            f'<div style="margin-left: auto; display: flex; gap: 10px">{login}{create}</div></header>')

def pubfooter(top, tone="dark"):
    fg = "#F5F2EC" if tone == "dark" else "#0C0C0D"; dim = "#A8A39B" if tone == "dark" else "#5F584F"
    line = "rgba(255,255,255,0.08)" if tone == "dark" else "rgba(0,0,0,0.08)"
    a = lambda t: f'<a href="#" style="color: {dim}; font-weight: 600; font-size: 15px; text-decoration: none">{t}</a>'
    return (f'<footer style="position: absolute; left: 0; right: 0; top: {top}px; padding: 40px 48px 32px; border-top: 1px solid {line}; display: flex; flex-direction: column; align-items: center; gap: 22px; color: {fg}">'
            f'<div style="display: flex; align-items: center; gap: 10px">{LOGO_TILE}<span style="font: 800 24px \'Schibsted Grotesk\', sans-serif; letter-spacing: -0.7px">partile</span></div>'
            f'<div style="display: flex; gap: 10px"><a href="Create.dc.html" style="height: 44px; padding: 0 18px; border-radius: 999px; background: {fg}; color: {"#0C0C0D" if tone == "dark" else "#F5F2EC"}; font-weight: 800; font-size: 14px; display: flex; align-items: center; text-decoration: none">Ücretsiz plan oluştur</a><a href="Occasion.dc.html" style="height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid {line}; color: {fg}; font-weight: 700; font-size: 14px; display: flex; align-items: center; text-decoration: none">Davetiye şablonları</a></div>'
            f'<div style="display: flex; gap: 22px; flex-wrap: wrap; justify-content: center">{a("Türkçe ▾")}{a("Yardım")}{a("Blog")}{a("Hakkında")}{a("Gizlilik")}{a("KVKK")}{a("Kullanım koşulları")}{a("Uygulamayı indir ↗")}</div>'
            f'<div style="font-size: 12px; color: {dim}">© 2026 partile · İstanbul</div></footer>')

def apply_logo():
    for f in P.glob("*.dc.html"):
        s = f.read_text()
        n = OLD_RAIL.sub(LOGO_RAIL, s)
        n = OLD_MOBILE.sub(LOGO_MOBILE, n)
        n = OLD_BIG.sub(LOGO_BIG, n)
        if n != s:
            f.write_text(n); print("logo ->", f.name)

def expand_templates():
    for f in (pathlib.Path(__file__).parent / "tpl").glob("*.tpl.html"):
        s = f.read_text()
        def sub(m):
            kind, arg = m.group(1), m.group(2)
            if kind == "RAIL":
                active, h = arg.split(":"); return rail(active, int(h))
            if kind == "TOPRIGHT": return TOPRIGHT
            if kind == "TABBAR": return tabbar(arg)
            if kind == "PUBNAV":
                active, tone = ((arg or "").split(":") + ["dark"])[:2]; return pubnav(active or None, tone)
            if kind == "PUBFOOTER":
                top, tone = (arg.split(":") + ["dark"])[:2]; return pubfooter(int(top), tone)
            if kind == "LOGO_BIG": return LOGO_BIG
            if kind == "LOGO_RAIL": return LOGO_RAIL
            if kind == "LOGO_TILE": return LOGO_TILE
            if kind == "LOGO_MOBILE": return LOGO_MOBILE
            if kind == "MARK": return MARK.format(s=arg, fg="#FFFFFF", hole="#0C0C0D", tick="#FFFFFF")
            raise SystemExit("unknown " + kind)
        out = re.sub(r"__(RAIL|TOPRIGHT|TABBAR|PUBNAV|PUBFOOTER|LOGO_BIG|LOGO_RAIL|LOGO_TILE|LOGO_MOBILE|MARK)(?::([^_]+))?__", sub, s)
        (P / f.name.replace(".tpl.html", ".dc.html")).write_text(out); print("built ->", f.name)

if __name__ == "__main__":
    apply_logo(); expand_templates()
