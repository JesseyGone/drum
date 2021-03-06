/**
 * DTX音乐脚本解析：
 * 0.请记住一些基本规则：
 * 0.1.只解析以"#"开头的行,其余的将被忽略
 * 0.2.如果出现";",说明是注释,可以新行注释,也可以行尾注释
 * 0.3.
 * 
 * 1.DTXCreator制鼓谱时关心以下10个通道:
 * 
 * -- Left Crash = LC = 吊镲(左)
 * -- Hi-hat_Closed = HH (Hi-hat_Opened = HHO) = 踩镲
 * -- LP = 增设的其他器件
 * -- Snare-SD = 军鼓
 * -- Tom1-HT = 嗵嗵鼓1(HighTom)
 * -- Bass-BD = 低音大鼓
 * -- Tom2-LT = 嗵嗵鼓2(LowTom)
 * -- Tom3-FT = 嗵嗵鼓3(FloorTom)
 * -- Ride-RD = 节奏镲
 * -- Right Crash-RC = 吊镲(右)
 * 
 * 通道对应（来自手册-16和19与DTXCreator有不同?暂以DTXC为准）
 * 11 = HiHatClose
 * 12 = Snare
 * 13 = BassDrum
 * 14 = HighTom
 * 15 = LowTom
 * 16 = Cymbal
 * 17 = FloorTom
 * 18 = HiHatOpen
 * 19 = RideCymbal
 * 1A = LeftCymbal
 * 
 * 本游戏采用的鼓种类和序列如下:
 * 0  1  2  3  4  5  6  7 
 * LC HH SD BD HT LT FT CY
 * 1A 11 12 13 14 15 17 16
 * 
 * 2.每个通道可以绑定最多主音色和副音色两种音色，但可以放置无限制种音色；
 * 2.1.通道绑定音色后放置音色为绑定音色，也可以选择WAV栏的音色放置；
 * 2.2.鼠标左键点击通道最顶端绑定主音色，按住Ctrl+鼠标左键绑定副音色；
 * 2.3.只有HH和LP的副音色与主音色编码不同，所以只有这两个设置副音色有效?
 * 
 * 1------2------3------4------5------6------7------8------9------10
 * LC-----HH-----LP-----SD-----HT-----BD-----LT-----FT-----RD-----RC
 * 1A-----11-----1C-----12-----14-----13-----15-----17-----19-----16(主音色编码)
 * 1A-----18-----1B-----12-----14-----13-----15-----17-----19-----16(副音色编码)
 * 
 * 2.4.文件结尾处记录绑定的主音色和副音色(左起通道编号/主音色/副音色):
 * ====源码=======================================================
 * #DTXC_LANEBINDEDCHIP: 01 1A 00
 * #DTXC_LANEBINDEDCHIP: 02 1B 2B
 * #DTXC_LANEBINDEDCHIP: 03 1C 2C
 * #DTXC_LANEBINDEDCHIP: 04 1D 00
 * #DTXC_LANEBINDEDCHIP: 05 1E 00
 * #DTXC_LANEBINDEDCHIP: 06 1F 00
 * #DTXC_LANEBINDEDCHIP: 07 1G 00
 * #DTXC_LANEBINDEDCHIP: 08 1H 00
 * #DTXC_LANEBINDEDCHIP: 09 1I 00
 * #DTXC_LANEBINDEDCHIP: 10 1J 00
 * #DTXC_CHIPPALETTE: 
 * ====源码=======================================================
 * 注:允许不绑定音色，也就是可不配置#DTXC_LANEBINDEDCHIP
 * 
 * 3.下面开始从.dtx文件第一行解析脚本(左起为行号):
 * ====源码=======================================================
 *    ---------------------------------------【标识1】此处开始记录dtx文件基本信息
 * 01 ; Created by DTXCreator 024------------created by
 * 02 
 * 03 #TITLE: some title---------------------标题(歌名)
 * 04 #ARTIST: some artist-------------------作者
 * 05 #COMMENT: www.dtxchina.com-------------标题下显示的文字
 * 06 #PANEL: some text www.dtxchina.com-----游戏中跑动的文字
 * 07 #PREVIEW: sound\pre.ogg----------------试听文件
 * 08 #PREIMAGE: graphics\bg.png-------------预览图片(204X269)
 * 09 #STAGEFILE: graphics\wait.jpg----------演奏时加载的图片(640X480)
 * 10 #BACKGROUND: graphics\bg.jpg-----------背景图片(640X480)
 * .. #WALL：<图像文件名>等同于#BACKGROUND:
 * 11 #RESULTIMAGE: graphics\bg.jpg----------结束图片(204X269)
 * .. #RESULTIMAGE_SS: graphics\bg.jpg----------结束图片(成绩为SS时)
 * .. #RESULTIMAGE_A: graphics\bg.jpg----------结束图片(成绩为A时)
 * .. #RESULTMOVIE：<视频文件名>
 * .. #RESULTMOVIE_xx：<视频文件名>(SS/S/A/B/C/D/E)
 * 12 #BPM: 127.500876568526-----------------BPM谱面速度-每分钟有多少个四分音符
 * 13 #DLEVEL: 50----------------------------鼓难度
 * .. #GLEVEL：<吉他水平(难度)> 
 * .. #BLEVEL：<基准面> (鼓/吉他的)难度基准1-100
 * 14 
 * 15 
 * 16 #GENRE: Hard Rock----------------------Free栏里随意填写内容
 * 17 #SIZE0F: 75----------------------------Free栏里随意填写内容
 * 18
 * 19 ---------------------------------------【标识2】此处开始记录WAV栏载入的音频文件
 * 20 #WAV01: sound\bg.mp3-------------------BGM音频文件(sound\bg.mp3注册在01通道上)
 * 21 #VOLUME01: 99--------------------------BGM音量(01通道的音量为99)
 * 22 #BGMWAV: 01----------------------------指定01为BGM
 * 23 #WAV28: drums\Snare_Custom.wav---------snare对应文件及编号28
 * 24 #VOLUME28: 25--------------------------snare音量
 * 25 #WAV2B: drums\REVERB_4.wav-------------tom1对应文件及编号2B
 * 26 #VOLUME2B: 25--------------------------tom1音量
 * .. #WAV03: drums\Snare_Hard.wav	;Snare---;Snare表示WAV栏下Label标签是Snare
 * .. #WAV04: drums\Tom1_Hard.wav	;HT------可以不指定音量
 * .. #WAV05: drums\Tom2_Hard.wav	;LT
 * .. #WAV06: drums\Tom3_Hard.wav	;FT
 * .. #WAV07: drums\Crash3.wav	;Right Crash
 * ......------------------------------------此处省略其他音频文件
 * 40 
 *    #BMP01: pic1.jpg-----------------------演奏时右边的图片
 * 41 
 * 42 #17802: 0.5----------------------------不知道是啥?
 * 43 #18502: 1------------------------------不知道是啥?
 * 44 
 * 45 
 * 46 #BPM01: 75-----------------------------知道怎么设置,但不知道是啥
 * 47 #BPM02: 75.95--------------------------
 * 48 #BPM03: 75.96--------------------------
 * 49 
 * 50 
 * 51 ---------------------------------------【标识3】此处开始记录正文-音符和时值
 * 52 #00001: ZZ-----------------------------第一行一般放置BGM
 * 53 #0081A: 31-----------------------------第二行
 * 54 #00811: 0028
 * 55 #00812: 00000028
 * 56 #00861: 0000000000000001
 * 57 #00913: 31000000000000000000003400340034
 * 58 #00911: 2A2A2A2A
 * 59 #00912: 00280028
 * 60 #10812: 0000000000000000000000000000000000000000000000002828000000000000
 * 
 * 
 * ====源码=======================================================
 * 
 * 3.1.dtx脚本正文每行是一"小节/音色"，第一行#00001一般放置BGM;
 * 3.1.1.第一行的ZZ表示WAV编号，对应【标识2】里记录的音频;
 * 3.1.2.第一行也可以这样写：#00001: 0100000000000000000000000000000000230000000000000000000000000000;
 * 3.1.3.第一行长度也可以是128位，甚至更多;
 * 3.2.dtx脚本正文规则:
 * 3.2.1.脚本正文每行都是一个键值对;
 * 3.2.2.键值对的key的#后面是5位数字，前三位是第几小节，后两位是通道编号;
 * 3.2.3.一般同一个小节有多行，因为同一个小节一般会包含多种音色（一般每个通道对应1-2种乐器）;
 * 3.2.4.键值对的value是音符的位置和时值，时值最细到十六分音符，长度一定是2的倍数;
 * 3.2.5.键值对的value每两位代表一种音色，00代表无音色；
 * 3.2.6.以line54为例（4/4拍）：在第8小节的编号为11的通道上，有一个二分音符，在第三拍上;
 * 3.2.7.以line55为例（4/4拍）：在第8小节的编号为12的通道上，有一个四分音符，在第四拍上;
 * 3.2.8.以line57为例（4/4拍）：在第9小节的编号为13的通道上，有四个十六分音符，分别在第1,12,14,16拍上;
 * 3.2.9.规则总结：n=value.length/2,该小节上的音符都是n分音符;
 * 
 */