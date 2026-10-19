<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); $t = mgt_copy(); ?>
<div class="site-frame"><a class="skip-link" href="#main"><?php echo esc_html($t['skip']); ?></a><div class="site-content"><div class="scroll-rail" aria-hidden="true"></div>
<header id="home" class="header"><div class="shell header-top">
  <a class="brand" href="<?php echo esc_url(mgt_url()); ?>" aria-label="<?php echo esc_attr($t['brandLabel']); ?>"><?php mgt_logo(); ?></a>
  <div class="header-tools"><form class="product-search" role="search" action="<?php echo esc_url(home_url('/products/')); ?>" method="get">
    <?php if (mgt_en()): ?><input type="hidden" name="lang" value="en"><?php endif; ?>
    <input name="q" type="search" maxlength="150" aria-label="<?php echo esc_attr($t['searchLabel']); ?>" placeholder="<?php echo esc_attr($t['searchPlaceholder']); ?>"><button type="submit" aria-label="<?php echo esc_attr($t['searchLabel']); ?>"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></svg></button>
  </form>
  <?php $request_path = wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/'; $switch = add_query_arg(wp_unslash($_GET), home_url($request_path)); $switch = mgt_en() ? remove_query_arg('lang', $switch) : add_query_arg('lang', 'en', $switch); ?>
  <a class="language-switch" href="<?php echo esc_url($switch); ?>" dir="ltr" aria-label="<?php echo esc_attr(mgt_text('Change site language to English','تغییر زبان سایت به فارسی')); ?>"><span><?php echo esc_html($t['switchLabel']); ?></span><svg class="globe-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12s1.1 6.6 3.3 9"/></svg></a></div>
</div></header>
<nav class="main-nav" aria-label="<?php echo esc_attr(mgt_text('منوی اصلی','Main navigation')); ?>"><div class="shell nav-inner">
<?php foreach (['/#home','/products/','/#about','/#contact'] as $i=>$path): ?><a href="<?php echo esc_url(mgt_url($path)); ?>"><?php echo esc_html($t['nav'][$i]); ?></a><?php endforeach; ?>
</div></nav>
