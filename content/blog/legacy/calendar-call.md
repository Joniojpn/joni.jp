---
title: "Calendar Call"
date: 2026-08-17
description: "オプション戦略の「カレンダー・コール」について"
published: false
listed: false
hugoPath: "/legacy/calendar-call/"
---

<div class="final_update">
<p>2021年10月7日</p>
</div>

<h2 style="margin-top:10px;">Calendar Call</h2>
<div class="well_dash">
    <li>horizontal spread strategy</li>
    
</div>

<h3>ポジション</h3>
<div class="table-wrap">
<table style="font-size:16px;">
<tbody>
<tr>
<td style="text-align:center; width:10%;">Leg</td>
<td style="text-align:center; width:70%;">対象</td>
<td style="text-align:center; width:20%;">アクション</td>
<tr>
<td style="text-align:center;">1</td>
<td style="text-align:left">Call（同一権利行使価格、期近）</td>
<td style="text-align:center">Short</td>
</tr>
<tr>
<td style="text-align:center;">2</td>
<td style="text-align:left">Call（同一権利行使価格、期先）</td>
<td style="text-align:center">Long</td>
</tr>
<tr>
<td style="text-align:center;">3</td>
<td style="text-align:left"></td>
<td style="text-align:center"></td>
</tr>
<tr>
<td style="text-align:center;">4</td>
<td style="text-align:left"></td>
<td style="text-align:center"></td>
</tr>
</tbody>
</table>
</div>

<h3>損益図</h3>
<p>IVが変化しなかった場合の損益図。</p>
<p><img src="/img/option/payoff/calendar-call.png"></p>

<p>コールではなくプットにすると、<a href="/option/calendar-put">Calendar Put</a>と呼ばれる。
どちらも損益図の形状は変わらず、どちらがより利益を得られるかで選択することになる。<p>

<div class="related">   
<li><a href="/trading/option/op13/">Pythonでカレンダー・スプレッドの損益図を描写する</a></li>
</div>

<h3>特徴</h3>
<ul>
<li>損失は限定的</li>
<li>利益は限定的</li>
<li>期近は期先に比べてタイムディケイの進行が速いことを利用する</li>
<li>デビット</li>
<li>原資産価格の急上昇は損失に繋がる</li>
</ul>

<hr>
<div class="reference-btn">
<a href="/option" class="btn-flat-border">Reference TOP</a>
</div>
