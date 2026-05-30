import os
import subprocess
import sys

def compress_mp3(file_path, bitrate="96k"):
    temp_output = file_path + ".temp.mp3"
    
    # Run ffmpeg command
    # -y: overwrite output files without asking
    # -i: input file
    # -map 0:a:0: map first audio stream
    # -b:a: audio bitrate (e.g., 96k)
    # -ar: audio sampling rate (44100 Hz)
    cmd = [
        "ffmpeg",
        "-y",
        "-i", file_path,
        "-map", "0:a:0",
        "-b:a", bitrate,
        "-ar", "44100",
        temp_output
    ]
    
    try:
        # Run ffmpeg silently
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        
        # Verify if compressed file exists and is smaller
        if os.path.exists(temp_output):
            orig_size = os.path.getsize(file_path)
            comp_size = os.path.getsize(temp_output)
            
            if comp_size < orig_size:
                os.remove(file_path)
                os.rename(temp_output, file_path)
                savings = (orig_size - comp_size) / orig_size * 100
                print(f"  [SUCCESS] Compressed: {orig_size/1024/1024:.2f}MB -> {comp_size/1024/1024:.2f}MB ({savings:.1f}% saved)")
                return True
            else:
                os.remove(temp_output)
                print(f"  [SKIP] Compressed file was not smaller than original.")
                return False
    except Exception as e:
        if os.path.exists(temp_output):
            os.remove(temp_output)
        print(f"  [ERROR] Failed to compress {os.path.basename(file_path)}: {e}")
        return False

def main():
    music_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Music Compressor starting in: {music_dir}\n")
    
    mp3_files = [f for f in os.listdir(music_dir) if f.endswith(".mp3") and not f.endswith(".temp.mp3") and f != "compress_music.py"]
    
    if not mp3_files:
        print("No MP3 files found.")
        return
        
    compressed_count = 0
    skipped_count = 0
    
    for f in sorted(mp3_files):
        file_path = os.path.join(music_dir, f)
        file_size = os.path.getsize(file_path)
        
        # Skip files that are already small (< 20MB)
        if file_size < 20 * 1024 * 1024:
            print(f"Skipping (Already Compressed): {f} ({file_size/1024/1024:.2f}MB)")
            skipped_count += 1
            continue
            
        print(f"Compressing: {f} ({file_size/1024/1024:.2f}MB)...")
        if compress_mp3(file_path):
            compressed_count += 1
        else:
            skipped_count += 1
            
    print(f"\nFinished! Compressed: {compressed_count}, Skipped: {skipped_count}")

if __name__ == "__main__":
    main()
