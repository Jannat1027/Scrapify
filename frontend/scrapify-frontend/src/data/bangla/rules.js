const rules = (() => {
  const zip = (english, bangla) => english.split(" ").map((word, i) => [word, bangla.split(" ")[i]]);

  const MONTHS = zip(
    "January February March April May June July August September October November December",
    "জানুয়ারি ফেব্রুয়ারি মার্চ এপ্রিল মে জুন জুলাই আগস্ট সেপ্টেম্বর অক্টোবর নভেম্বর ডিসেম্বর",
  );
  const SHORT_MONTHS = MONTHS.map(([english, bangla]) => [english.slice(0, 3), bangla]);
  const WEEKDAYS = zip(
    "Monday Tuesday Wednesday Thursday Friday Saturday Sunday",
    "সোমবার মঙ্গলবার বুধবার বৃহস্পতিবার শুক্রবার শনিবার রবিবার",
  );

  return {
    PATTERNS: [
      [/^Good morning, (.+)$/, "শুভ সকাল, $1"],
      [/^Good afternoon, (.+)$/, "শুভ অপরাহ্ন, $1"],
      [/^Good evening, (.+)$/, "শুভ সন্ধ্যা, $1"],
      [/^(\d+)% sure$/, "$1% নিশ্চিত"],
      [/^(\d+) days? ago$/, "$1 দিন আগে"],
      [/^(\d+) available$/, "$1টি উপলব্ধ"],
      [/^(\d+) claimed$/, "$1টি দাবিকৃত"],
      [/^(\d+) listed all time$/, "মোট $1টি তালিকাভুক্ত"],
      [/^(\d+) of (\d+) settled$/, "$2টির মধ্যে $1টি নিষ্পন্ন"],
      [/^(\d+) of 6$/, "৬টির মধ্যে $1টি"],
      [/^([\d,]+) kg graded$/, "$1 কেজি গ্রেড করা হয়েছে"],
      [/^(\d+) rates? (?:are|is) out of date\.$/, "$1টি দর পুরনো হয়ে গেছে।"],
      [/^(.+) rates haven't been updated in over 14 days\.$/, "$1-এর দর ১৪ দিনের বেশি হালনাগাদ হয়নি।"],
      [/^Confidence is only (\d+)%\. Confirm or pick the plastic yourself\.$/,
        "নিশ্চয়তা মাত্র $1%। নিশ্চিত করুন অথবা নিজে প্লাস্টিক বেছে নিন।"],
      [/^The photo looks (\w+)\. A retake usually fixes this\.$/,
        "ছবিটি $1 মনে হচ্ছে। আবার তুললে সাধারণত ঠিক হয়ে যায়।"],
      [/^Suspend (.+)\?$/, "$1 স্থগিত করবেন?"],
      [/^Suspend (.+)$/, "$1 স্থগিত করুন"],
      [/^Approve (.+)\?$/, "$1 অনুমোদন করবেন?"],
      [/^Flag (.+)\?$/, "$1 চিহ্নিত করবেন?"],
      [/^(.+) suspended\.$/, "$1 স্থগিত করা হয়েছে।"],
      [/^(.+) is now (.+)\.$/, "$1 এখন $2।"],
      [/^(.+) rates saved\.$/, "$1-এর দর সংরক্ষিত হয়েছে।"],
      [/^(.+) added\.$/, "$1 যোগ করা হয়েছে।"],
      [/^Reason: (.+)$/, "কারণ: $1"],
      [/^[Ll]isting (LS-\w+)$/, "তালিকা $1"],
      [/^(.+) kg for (.+)\. The operator is notified straight away\.$/,
        "$2 দামে $1 কেজি। অপারেটরকে সঙ্গে সঙ্গে জানানো হবে।"],
      [/^(.+) kg of (.+)\. Suggested range (.+)\.$/, "$1 কেজি $2। প্রস্তাবিত দর $3।"],
      [/^(.+) KB → (.+) KB after compression$/, "সংকোচনের পর $1 KB থেকে $2 KB"],
      [/^(.+) per kg on average$/, "গড়ে প্রতি কেজি $1"],
      [/^(.+)\/kg$/, "$1/কেজি"],
    ],

    WORDS: Object.fromEntries([
      ...MONTHS,
      ...SHORT_MONTHS,
      ["Sept", "সেপ্টেম্বর"],
      ...WEEKDAYS,
      ["kg", "কেজি"],
      ["sec", "সেকেন্ড"],
      ["days", "দিন"],
    ]),
  };
})();

export default rules;
