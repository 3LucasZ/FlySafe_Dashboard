#include "BluetoothA2DPSource.h"
#include <Wire.h>
#include <LIDARLite.h>

#include "1.h"
#include "2.h"
#include "3.h"
#include "4.h"
#include "5.h"
#include "6.h"
#include "7.h"
#include "8.h"
#include "9.h"

#include "10.h"
#include "20.h"
#include "30.h"
#include "40.h"
#include "50.h"

#include "0.h"
#include "point.h"
#include "none.h"

/*
NOTES:
TRUE: Use const for raw sound arrays to reduce dynamic RAM usage
TRUE: You can not use bluetooth with wifi
TRUE: Hold down BOOT NOT EN when loading to ESP32
MYTH: Never use Serial monitor or interact with Serial during BLE use (It just restarts the bluetooth, not a big deal)
MYTH: Moving an Arduino project from the Arduino folder to Desktop will break the project (libraries are handled through absolute dir)
 */

BluetoothA2DPSource a2dp_source;

SoundData *one = new OneChannelSoundData((int16_t*)__1_raw, __1_raw_len/2);
SoundData *two = new OneChannelSoundData((int16_t*)__2_raw, __2_raw_len/2);
SoundData *three = new OneChannelSoundData((int16_t*)__3_raw, __3_raw_len/2);
SoundData *four = new OneChannelSoundData((int16_t*)__4_raw, __4_raw_len/2);
SoundData *five = new OneChannelSoundData((int16_t*)__5_raw, __5_raw_len/2);
SoundData *six = new OneChannelSoundData((int16_t*)__6_raw, __6_raw_len/2);
SoundData *seven = new OneChannelSoundData((int16_t*)__7_raw, __7_raw_len/2);
SoundData *eight = new OneChannelSoundData((int16_t*)__8_raw, __8_raw_len/2);
SoundData *nine = new OneChannelSoundData((int16_t*)__9_raw, __9_raw_len/2);

SoundData *ten = new OneChannelSoundData((int16_t*)__10_raw, __10_raw_len/2);
SoundData *twenty = new OneChannelSoundData((int16_t*)__20_raw, __20_raw_len/2);
SoundData *thirty = new OneChannelSoundData((int16_t*)__30_raw, __30_raw_len/2);
SoundData *fourty = new OneChannelSoundData((int16_t*)__40_raw, __40_raw_len/2);
SoundData *fifty = new OneChannelSoundData((int16_t*)__50_raw, __50_raw_len/2);

SoundData *point = new OneChannelSoundData((int16_t*)point_raw, point_raw_len/2);
SoundData *zero = new OneChannelSoundData((int16_t*)__0_raw, __0_raw_len/2);
SoundData *none = new OneChannelSoundData((int16_t*)none_raw, none_raw_len/2);

SoundData *ones[10];

SoundData *tens[6];


LIDARLite lidar;

void setup() {
  Serial.begin(115200);
  a2dp_source.start("GP-508B");  
  a2dp_source.set_volume(100);

  ones[0]=none;
  ones[1]=one;
  ones[2]=two;
  ones[3]=three;
  ones[4]=four;
  ones[5]=five;
  ones[6]=six;
  ones[7]=seven;
  ones[8]=eight;
  ones[9]=nine;
  
  tens[0]=none;
  tens[1]=ten;
  tens[2]=twenty;
  tens[3]=thirty;
  tens[4]=fourty;
  tens[5]=fifty;

  lidar.begin(0, true); // Set configuration to default and I2C to 400 kHz
  lidar.configure(0); // Change this number to try out alternate configurations
}

void loop() {
  //read frame
  int decimeters = round(lidar.distance()/10.0);
  int precision = 3;
  
  Serial.print("dm:");
  Serial.println(decimeters);
  

  
  int speakDecimal = decimeters%10;
  decimeters/=10;
  int speakOnes = decimeters%10;
  decimeters/=10;
  int speakTens = decimeters%10;
  decimeters/=10;

  if (precision>=1){
    a2dp_source.write_data(tens[speakTens]);
    delay(400);
  }
  if (precision>=2){
    a2dp_source.write_data(ones[speakOnes]);
    delay(400);
  }
  if (precision>=3){
    a2dp_source.write_data(point);
    delay(400);
  }
  if (precision>=3){
  a2dp_source.write_data(ones[speakDecimal]);
  delay(400);
  }
}
