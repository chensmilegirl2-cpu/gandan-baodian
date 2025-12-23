
import { ThemeColor, TasteType } from '../types';

export const THEME_COLORS: ThemeColor[] = ['orange', 'emerald', 'blue', 'rose', 'violet', 'amber', 'indigo', 'teal'];
export const TASTES: TasteType[] = ['酸', '甜', '苦', '辣', '咸'];

export const THEME_CONFIG: Record<ThemeColor, { bg: string; text: string; light: string; border: string; accent: string }> = {
  orange: { bg: 'bg-orange-400', text: 'text-orange-500', light: 'bg-orange-50', border: 'border-orange-100', accent: 'text-orange-600' },
  emerald: { bg: 'bg-emerald-400', text: 'text-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100', accent: 'text-emerald-600' },
  blue: { bg: 'bg-blue-400', text: 'text-blue-500', light: 'bg-blue-50', border: 'border-blue-100', accent: 'text-blue-600' },
  rose: { bg: 'bg-rose-400', text: 'text-rose-500', light: 'bg-rose-50', border: 'border-rose-100', accent: 'text-rose-600' },
  violet: { bg: 'bg-violet-400', text: 'text-violet-500', light: 'bg-violet-50', border: 'border-violet-100', accent: 'text-violet-600' },
  amber: { bg: 'bg-amber-400', text: 'text-amber-500', light: 'bg-amber-50', border: 'border-amber-100', accent: 'text-amber-600' },
  indigo: { bg: 'bg-indigo-400', text: 'text-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-100', accent: 'text-indigo-600' },
  teal: { bg: 'bg-teal-400', text: 'text-teal-500', light: 'bg-teal-50', border: 'border-teal-100', accent: 'text-teal-600' }
};

export const PET_MESSAGES = [
  "今天吃得好香呀，我也跟着变强了呢！",
  "干饭人，干饭魂，干饭都是人上人！",
  "主人主人，明天我们吃什么呀？(期待脸)",
  "刚才那顿饭看起来超赞的！",
  "摸摸头，心情好~ 喵呜",
  "我们要一直一直在一起干饭哦！",
  "感觉肚子里充满了能量！准备好下一次干饭了！",
  "又是充满烟火气的一天，开心！",
  "主人辛苦啦，吃饱了才有力气努力工作~",
  "你的胃今天一定很幸福吧？",
  "陪在主人身边干饭，是世界上最开心的事！",
  "咕噜咕噜... 还要更多美味能量！",
  "不管发生什么，都要按时干饭哦。",
  "你看你看，我是不是又长可爱了一点？",
  "主人，你的干饭速度在我的意料之中呢~",
  "又是被美食治愈的一天，主人好棒！",
  "我可以帮你试毒吗？虽然我只吃能量气泡...",
  "嘿嘿，刚才偷偷看你干饭了，真好看！",
  "叮！今日份可爱已送达，请主人签收~",
  "如果你累了，就靠在我的肉垫上休息一下吧。",
  "饭后的每一分钟，都是为了下一顿在期待！",
  "只要有美食，阴天也会变晴天的！",
  "你是最棒的干饭家，我是你最忠诚的小跟班！",
  "今天也要陪我一起好好干饭~哦",
  "我的小肚子圆鼓鼓的，都是幸福的形状！",
  "刚才那个菜，隔壁宠物都馋哭了！"
];

export const TREE_MESSAGES = [
  "喝点水，感觉枝叶都舒展开了~",
  "快看！我长出了新的希望哦！",
  "每一顿饭都是我长大的动力！",
  "庄园里充满了幸福的味道呢。",
  "我的根系感觉到了美味的震动！",
  "再来一顿，我也许就能开花啦~",
  "谢谢主人的照料，我会茁壮成长的！",
  "这里是干饭人的秘密基地，我也在努力哦。",
  "风吹过来，我的叶子在说：主人辛苦啦！",
  "努力发芽，也要努力干饭！",
  "感觉空气里都是红烧肉的香味，吸溜~",
  "我正在把你的干饭能量转化为森林的呼吸！",
  "这里的泥土，都散发着米饭的芬芳...",
  "主人，你看我的年轮，是不是又粗了一圈？",
  "只要你按时吃饭，我就会永远常青。",
  "在我的树荫下打个盹吧，梦里全是好吃的！",
  "听，那是叶子在为你干饭成功的鼓掌声！",
  "今天也要陪我一起好好干饭~哦",
  "阳光和你，就是我最好的养分！"
];
