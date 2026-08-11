from PIL import Image, ImageDraw
img = Image.new('RGB', (800, 1000), (30, 30, 30))
draw = ImageDraw.Draw(img)
draw.rectangle([120, 80, 680, 920], fill=(240, 240, 240))
draw.rectangle([160, 120, 640, 880], outline=(50, 50, 50), width=6)
img.save('test_document.png')
print('created test_document.png')
