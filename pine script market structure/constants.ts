
export const PINE_SCRIPT_CODE = `
//@version=5
indicator("Market Structure (HH/HL/LL/LH) v2", shorttitle="MS v2", overlay=true, max_labels_count=500, max_lines_count=500)

// Script Operation Note:
// This script processes data on the current chart timeframe.
// In TradingView, Pine Script automatically handles historical and real-time data candle by candle.
// Output (labels/lines) will only appear when specific market structure conditions, based on detected swing points, are met.
// This might take some time on a new chart or if market conditions don't produce clear swings/breaks according to the settings.
// For optimal performance on specific assets (e.g., Bitcoin) and timeframes, experiment with "Pivot Lookback Left" and "Pivot Lookback Right" settings.

// User Inputs
pivotLookbackLeft = input.int(10, title="Pivot Lookback Left", minval=1)
pivotLookbackRight = input.int(10, title="Pivot Lookback Right", minval=1)
showLabels = input.bool(true, title="Show Structure Labels (HH, HL, LL, LH)")
showBOSLabels = input.bool(true, title="Show BOS/CHoCH Labels")
showZigZagLines = input.bool(true, title="Show Zig-Zag Structure Lines")
showBOSLines = input.bool(true, title="Show Horizontal BOS/CHoCH Lines")

// Colors
colorHH = input.color(color.new(color.green, 0), title="HH Label Color")
colorHL = input.color(color.new(color.lime, 0), title="HL Label Color")
colorLL = input.color(color.new(color.red, 0), title="LL Label Color")
colorLH = input.color(color.new(color.maroon, 0), title="LH Label Color")
colorCHoCHPos = input.color(color.new(color.blue, 0), title="CHoCH+ Label/Line Color")
colorCHoCHNeg = input.color(color.new(color.orange, 0), title="CHoCH- Label/Line Color")
colorBOSPos = input.color(color.new(color.aqua, 0), title="BOS+ Label/Line Color")
colorBOSNeg = input.color(color.new(color.purple, 0), title="BOS- Label/Line Color")
colorZigZagUptrend = input.color(color.new(color.green, 50), title="Zig-Zag Uptrend Color")
colorZigZagDowntrend = input.color(color.new(color.red, 50), title="Zig-Zag Downtrend Color")

// Swing Point Detection
swingHighPrice = ta.pivothigh(high, pivotLookbackLeft, pivotLookbackRight)
swingLowPrice = ta.pivotlow(low, pivotLookbackLeft, pivotLookbackRight)

// State Variables for Market Structure (using time for line x-coordinates)
var int lastHHTime = na
var float lastHHPrice = na
var int lastHLTime = na
var float lastHLPrice = na
var int lastLLTime = na
var float lastLLPrice = na
var int lastLHTime = na
var float lastLHPrice = na

// State for Zig-Zag lines (using time for line x-coordinates)
var int lineStartTime = na
var float lineStartY = na

// Trend State
var int trend = 0 // 0 = undefined, 1 = uptrend, -1 = downtrend
var bool chochOccurred = false // Flag to distinguish initial CHoCH from subsequent BOS. True if last break was CHoCH. False if BOS, HL, or LH.

// Function to draw labels
draw_label(x_bar_index, y_price, _text, _color, _style, _yloc, _textcolor) =>
    isStructureLabel = _text == "HH" or _text == "HL" or _text == "LL" or _text == "LH"
    isEventLabel = _text == "CHoCH+" or _text == "CHoCH-" or _text == "BOS+" or _text == "BOS-"

    if (isStructureLabel and showLabels) or (isEventLabel and showBOSLabels)
        label.new(x_bar_index, y_price, _text, color=_color, textcolor=_textcolor, style=_style, yloc=_yloc, size=size.small)

// Function to draw horizontal lines for BOS/CHoCH
draw_bos_line(point1_time, point1_price, point2_time, _color) =>
    if showBOSLines and not na(point1_time) and not na(point1_price) and not na(point2_time)
        line.new(x1=point1_time, y1=point1_price, x2=point2_time, y2=point1_price, xloc=xloc.bar_time, extend=extend.right, color=_color, style=line.style_dashed, width=1)

// Function to draw zig-zag lines
draw_zigzag_line(x1_time, y1_price, x2_time, y2_price, _color) =>
    if showZigZagLines and not na(x1_time) and not na(y1_price) and not na(x2_time) and not na(y2_price)
        line.new(x1=x1_time, y1=y1_price, x2=x2_time, y2=y2_price, xloc=xloc.bar_time, color=_color, width=1)

// --- Process Swing Highs ---
if not na(swingHighPrice) // A swing high is confirmed pivotLookbackRight bars ago
    currentPivotBar = bar_index[pivotLookbackRight]
    currentPivotTime = time[pivotLookbackRight]
    isBullishBreak = false 

    // Check for CHoCH+ (Bullish Change of Character)
    if trend != 1 and not na(lastLHPrice[1]) and swingHighPrice > lastLHPrice[1] and (not chochOccurred or trend == -1) // Added (not chochOccurred or trend == -1) to ensure it's a fresh CHoCH
        draw_label(currentPivotBar, swingHighPrice, "CHoCH+", colorCHoCHPos, label.style_label_down, yloc.abovebar, color.white)
        draw_label(currentPivotBar, swingHighPrice, "HH", colorHH, label.style_label_down, yloc.abovebar, color.white) // Label as HH
        draw_bos_line(lastLHTime[1], lastLHPrice[1], currentPivotTime, colorCHoCHPos)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingHighPrice, colorZigZagUptrend)
        
        trend := 1
        chochOccurred := true
        isBullishBreak := true

    // Else, check for BOS+ (Bullish Break of Structure)
    else if trend == 1 and not na(lastHHPrice[1]) and swingHighPrice > lastHHPrice[1]
        draw_label(currentPivotBar, swingHighPrice, "BOS+", colorBOSPos, label.style_label_down, yloc.abovebar, color.white)
        draw_label(currentPivotBar, swingHighPrice, "HH", colorHH, label.style_label_down, yloc.abovebar, color.white) // Label as HH
        draw_bos_line(lastHHTime[1], lastHHPrice[1], currentPivotTime, colorBOSPos)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingHighPrice, colorZigZagUptrend)

        isBullishBreak := true
        chochOccurred := false // BOS confirms trend continuation, so CHoCH state is resolved

    if isBullishBreak
        lastHHPrice := swingHighPrice
        lastHHTime := currentPivotTime
        lineStartTime := currentPivotTime
        lineStartY := swingHighPrice
        // Removed: Logic that pre-emptively set lastHLPrice using lastLLPrice[1] after CHoCH.
        // HL will now be determined by a subsequent swingLowPrice.
    
    // Logic for Lower High (LH)
    else if trend == -1 and not na(lastLLPrice) and (na(lastLHPrice[1]) or swingHighPrice < lastLHPrice[1]) and swingHighPrice > lastLLPrice[1]
        draw_label(currentPivotBar, swingHighPrice, "LH", colorLH, label.style_label_down, yloc.abovebar, color.white)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingHighPrice, colorZigZagDowntrend)
        lastLHPrice := swingHighPrice
        lastLHTime := currentPivotTime
        lineStartTime := currentPivotTime
        lineStartY := swingHighPrice
        chochOccurred := false // LH confirms downtrend structure, CHoCH state resolved.

    // Initial LH if trend is undefined
    else if trend == 0 and (na(lastLHPrice[1]) or swingHighPrice < lastLHPrice[1])
        // Potentially an initial LH, but don't draw label or line until trend context is clearer
        lastLHPrice := swingHighPrice
        lastLHTime := currentPivotTime
        // lineStartTime := currentPivotTime // Only set line start on confirmed structural points
        // lineStartY := swingHighPrice


// --- Process Swing Lows ---
if not na(swingLowPrice) // A swing low is confirmed pivotLookbackRight bars ago
    currentPivotBar = bar_index[pivotLookbackRight]
    currentPivotTime = time[pivotLookbackRight]
    isBearishBreak = false

    // Check for CHoCH- (Bearish Change of Character)
    if trend != -1 and not na(lastHLPrice[1]) and swingLowPrice < lastHLPrice[1] and (not chochOccurred or trend == 1) // Added (not chochOccurred or trend == 1)
        draw_label(currentPivotBar, swingLowPrice, "CHoCH-", colorCHoCHNeg, label.style_label_up, yloc.belowbar, color.white)
        draw_label(currentPivotBar, swingLowPrice, "LL", colorLL, label.style_label_up, yloc.belowbar, color.white) // Label as LL
        draw_bos_line(lastHLTime[1], lastHLPrice[1], currentPivotTime, colorCHoCHNeg)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingLowPrice, colorZigZagDowntrend)
            
        trend := -1
        chochOccurred := true
        isBearishBreak := true

    // Else, check for BOS- (Bearish Break of Structure)
    else if trend == -1 and not na(lastLLPrice[1]) and swingLowPrice < lastLLPrice[1]
        draw_label(currentPivotBar, swingLowPrice, "BOS-", colorBOSNeg, label.style_label_up, yloc.belowbar, color.white)
        draw_label(currentPivotBar, swingLowPrice, "LL", colorLL, label.style_label_up, yloc.belowbar, color.white) // Label as LL
        draw_bos_line(lastLLTime[1], lastLLPrice[1], currentPivotTime, colorBOSNeg)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingLowPrice, colorZigZagDowntrend)
        
        isBearishBreak := true
        chochOccurred := false // BOS confirms trend continuation

    if isBearishBreak
        lastLLPrice := swingLowPrice
        lastLLTime := currentPivotTime
        lineStartTime := currentPivotTime
        lineStartY := swingLowPrice
        // Removed: Logic that pre-emptively set lastLHPrice using lastHHPrice[1] after CHoCH.
        // LH will now be determined by a subsequent swingHighPrice.

    // Logic for Higher Low (HL)
    else if trend == 1 and not na(lastHHPrice) and (na(lastHLPrice[1]) or swingLowPrice > lastHLPrice[1]) and swingLowPrice < lastHHPrice[1]
        draw_label(currentPivotBar, swingLowPrice, "HL", colorHL, label.style_label_up, yloc.belowbar, color.white)
        draw_zigzag_line(lineStartTime[1], lineStartY[1], currentPivotTime, swingLowPrice, colorZigZagUptrend)
        lastHLPrice := swingLowPrice
        lastHLTime := currentPivotTime
        lineStartTime := currentPivotTime
        lineStartY := swingLowPrice
        chochOccurred := false // HL confirms uptrend structure, CHoCH state resolved.
    
    // Initial HL if trend is undefined
    else if trend == 0 and (na(lastHLPrice[1]) or swingLowPrice > lastHLPrice[1])
        // Potentially an initial HL
        lastHLPrice := swingLowPrice
        lastHLTime := currentPivotTime
        // lineStartTime := currentPivotTime // Only set line start on confirmed structural points
        // lineStartY := swingLowPrice

// --- End of Script ---
`;

export const GENERATION_PROMPT = `
Create a Pine Script v5 indicator for TradingView to identify and draw market structure points: Higher Highs (HH), Higher Lows (HL), Lower Lows (LL), and Lower Highs (LH). The script should also identify and label Break of Structure (BOS) and the initial Change of Character (CHoCH).

Core Requirements:

Swing Point Detection:
Use ta.pivothigh() and ta.pivotlow() to detect swing highs and swing lows.
Allow user input for pivotLookbackLeft and pivotLookbackRight (default to a reasonable value like 10).

Market Structure Logic:
Maintain state to track the last confirmed significant swing high and swing low. For points used as x-coordinates in lines that might extend far back, store their 'time' (timestamp) instead of 'bar_index' to avoid "bar index too far" errors.
Uptrend Logic:
A Higher High (HH) is a new swing high that is greater than the previous confirmed swing high.
A Higher Low (HL) is a new swing low that is greater than the previous confirmed swing low and occurs after a HH. An HL should be a confirmed swing point after a CHoCH or a prior HL in an established uptrend.
Downtrend Logic:
A Lower Low (LL) is a new swing low that is less than the previous confirmed swing low.
A Lower High (LH) is a new swing high that is less than the previous confirmed swing high and occurs after an LL. An LH should be a confirmed swing point after a CHoCH or a prior LH in an established downtrend.
The script must correctly identify the alternating sequence of swing highs and lows to define structure.

Break of Structure (BOS) / Change of Character (CHoCH):
CHoCH (Bullish): In a prior downtrend, if a swing high breaks above the last confirmed Lower High. The low before this break *does not automatically* become the first HL; instead, the script should wait for a subsequent swing low to form and confirm it as the HL.
CHoCH (Bearish): In a prior uptrend, if a swing low breaks below the last confirmed Higher Low. The high before this break *does not automatically* become the first LH; instead, the script should wait for a subsequent swing high to form and confirm it as the LH.
BOS (Bullish): In an established uptrend (after a bullish CHoCH or continuation), if a swing high breaks above the last confirmed Higher High.
BOS (Bearish): In an established downtrend (after a bearish CHoCH or continuation), if a swing low breaks below the last confirmed Lower Low.
The script should use a flag (e.g., 'chochOccurred') to differentiate if the last structural break was a CHoCH. This flag is reset once a new HL (after bullish CHoCH) or LH (after bearish CHoCH) is formed, or if a BOS occurs.

Visualization:
Plot text labels ("HH", "HL", "LL", "LH", "BOS+", "BOS-", "CHoCH+", "CHoCH-") above/below the respective candles where these points/events are confirmed. Labels can use bar_index for their x-coordinate.
Optionally draw horizontal lines from BOS/CHoCH points. These lines should start at the time and price of the broken structural point (x1, y1) and extend to the time of the breakout confirmation bar (x2), using the same price for y2 to maintain horizontality. Use \`xloc=xloc.bar_time\` and \`extend=extend.right\` for these lines.
Optionally draw zig-zag lines connecting the confirmed swing points (HH-HL sequence in uptrends, LH-LL sequence in downtrends). For these lines, use 'time' for both x1 and x2 with xloc=xloc.bar_time.

User Inputs:
pivotLookbackLeft: Integer for left bars in pivot detection.
pivotLookbackRight: Integer for right bars in pivot detection.
showLabels: Boolean to toggle HH/HL/LL/LH labels.
showBOSLabels: Boolean to toggle BOS/CHoCH specific labels.
showZigZagLines: Boolean to toggle zig-zag lines.
showBOSLines: Boolean to toggle horizontal BOS/CHoCH lines.
Color inputs for all labels, BOS/CHoCH lines, and zig-zag lines (separate for uptrend/downtrend).

Timeframe Adaptability: The script should inherently work on the current chart timeframe by using the pivotLookback relative to that timeframe's candles. A comment should remind users to tune pivot lookbacks for specific assets/timeframes.

Output:
The script should overlay these structural elements clearly on the price chart, helping traders to visually analyze the market's flow and identify potential trend continuations or reversals based on classic market structure principles. Ensure the logic correctly handles the sequence of highs and lows for accurate point identification, especially how HLs and LHs are established following a CHoCH.
`;
